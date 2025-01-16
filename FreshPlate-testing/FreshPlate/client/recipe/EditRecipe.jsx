import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  styled,
  IconButton
} from '@mui/material';
import { Upload, Delete, Edit } from 'lucide-react';
import auth from "../lib/auth-helper";
import { read, update } from './api-recipe';
import defaultRecipeImage from "../src/assets/defaultFoodImage.png";


const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#fff',
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#666',
  },
});

export default function EditRecipe() {
  const [recipe, setRecipe] = useState({
    title: '',
    ingredients: '',
    instructions: '',
    preptime: '',
    cooktime: '',
    servings: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const recipeId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!recipeId) {
        setError("No recipe ID provided");
        setLoading(false);
        return;
      }

      try {
        const jwt = auth.isAuthenticated();
        if (!jwt) {
          throw new Error("User not authenticated");
        }

        const data = await read({ recipeId: recipeId }, { t: jwt.token });
        if (!data) {
          throw new Error("Failed to fetch recipe data");
        }
        setRecipe(data);
        if (data.image && data.image.data) {
          const imageData = typeof data.image.data === 'string' 
            ? data.image.data 
            : btoa(String.fromCharCode.apply(null, new Uint8Array(data.image.data.data)));
          setImagePreview(`data:${data.image.contentType};base64,${imageData}`);
        } else {
          setImagePreview(defaultRecipeImage)
        }
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError("Failed to load recipe. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setRecipe(prevRecipe => ({
        ...prevRecipe,
        image: file
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageDelete = () => {
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      image: null
    }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const jwt = auth.isAuthenticated();
      if (!jwt) {
        throw new Error("User not authenticated");
      }

      const formData = new FormData();
      Object.keys(recipe).forEach(key => {
        if (key === 'image') {
          if (recipe[key] instanceof File) {
            formData.append('image', recipe[key]);
          } else if (recipe[key] === null) {
            formData.append('deleteImage', 'true');
          }
        } else {
          formData.append(key, recipe[key]);
        }
      });

      const updatedRecipe = await update(
        { recipeId: recipeId },
        { t: jwt.token },
        formData
      );

      if (!updatedRecipe) {
        throw new Error('Failed to update recipe');
      }

      if (updatedRecipe.error) {
        throw new Error(updatedRecipe.error);
      }

      setNotification({ open: true, message: 'Recipe updated successfully', severity: 'success' });
      setTimeout(() => navigate('/recipelist'), 2000);
    } catch (error) {
      console.error('Error updating recipe:', error);
      setNotification({ open: true, message: error.message || 'Failed to update recipe', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '100%', bgcolor: '#fff9f5', minHeight: '100vh', py: 4 }}>
      <Typography 
        variant="h1" 
        sx={{ 
          textAlign: 'center', 
          color: '#ff4400', 
          fontSize: '2.5rem',
          mb: 4 
        }}
      >
        Recipes
      </Typography>

      <Box 
        sx={{ 
          maxWidth: 600,
          mx: 'auto',
          bgcolor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          p: 3
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'normal' }}>
          Edit Recipe
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          <Box sx={{ mb: 2 }}>
              <Typography sx={{ mb: 1, color: '#666' }}>Recipe Image</Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 200,
                  border: '1px dashed #ccc',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Recipe"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        p: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)'
                      }}
                    >
                      <IconButton
                        component="label"
                        sx={{ mr: 1 }}
                      >
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        <Edit size={20} />
                      </IconButton>
                      {/* <IconButton onClick={handleImageDelete}>
                        <Delete size={20} />
                      </IconButton> */}
                    </Box>
                  </>
                ) : (
                  <Button
                    component="label"
                    startIcon={<Upload />}
                  >
                    Upload Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                )}
              </Box>
            </Box>

            <Box>
              <Typography sx={{ mb: 1, color: '#666' }}>Recipe Title*</Typography>
              <StyledTextField
                fullWidth
                name="title"
                value={recipe.title}
                onChange={handleChange}
                required
                variant="outlined"
                size="small"
              />
            </Box>

            <Box>
              <Typography sx={{ mb: 1, color: '#666' }}>Ingredients*</Typography>
              <StyledTextField
                fullWidth
                name="ingredients"
                value={recipe.ingredients}
                onChange={handleChange}
                multiline
                rows={4}
                required
                variant="outlined"
                size="small"
              />
            </Box>

            <Box>
              <Typography sx={{ mb: 1, color: '#666' }}>Instructions*</Typography>
              <StyledTextField
                fullWidth
                name="instructions"
                value={recipe.instructions}
                onChange={handleChange}
                multiline
                rows={6}
                required
                variant="outlined"
                size="small"
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ mb: 1, color: '#666' }}>Prep Time</Typography>
                <StyledTextField
                  fullWidth
                  name="preptime"
                  type="number"
                  value={recipe.preptime}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">Minutes</InputAdornment>,
                  }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography sx={{ mb: 1, color: '#666' }}>Cook Time</Typography>
                <StyledTextField
                  fullWidth
                  name="cooktime"
                  type="number"
                  value={recipe.cooktime}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">Minutes</InputAdornment>,
                  }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography sx={{ mb: 1, color: '#666' }}>Servings</Typography>
                <StyledTextField
                  fullWidth
                  name="servings"
                  type="number"
                  value={recipe.servings}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                fullWidth
                type="submit"
                sx={{
                  bgcolor: '#333',
                  color: 'white',
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#444'
                  }
                }}
              >
                Update Recipe
              </Button>
              <Button
                fullWidth
                onClick={() => navigate('/recipelist')}
                sx={{
                  border: '1px solid #ddd',
                  color: '#666',
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#f5f5f5'
                  }
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </form>
      </Box>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}