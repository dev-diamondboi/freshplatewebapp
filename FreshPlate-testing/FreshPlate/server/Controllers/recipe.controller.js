import Recipe from '../Models/recipe.model.js'
import errorHandler from '../Controllers/error.controller.js'
import formidable from "formidable";
import fs from 'fs'

const createRecipe = async (req, res) => {
  let form = formidable({ keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        message: "Image could not be uploaded",
      });
    }
    Object.keys(fields).forEach((key) => (fields[key] = fields[key][0]));
    Object.keys(files).forEach((key) => (files[key] = files[key][0]));
    let recipe = new Recipe(fields);
    recipe.creator = req.auth.name
    if (files.image) {
      recipe.image.data = fs.readFileSync(files.image.filepath);
      recipe.image.contentType = files.image.mimetype;
    }
    try {
      let result = await recipe.save();
      res.json(result);
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err),
      });
    }
  });
  }

  const getAllRecipes = async (req, res) => {
    try {
      let recipes = await Recipe.find().select('title ingredients instructions creator preptime cooktime servings created updated image');
      
      recipes = recipes.map(recipe => {
        const recipeObj = recipe.toObject();
        if (recipeObj.image && recipeObj.image.data) {
          return {
            ...recipeObj,
            image: {
              contentType: recipeObj.image.contentType,
              data: recipeObj.image.data.toString('base64')
            }
          };
        }
        return recipeObj;
      });
  
      res.json(recipes);
    } catch (err) {
      console.error('Error in getAllRecipes:', err);
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      });
    }
  };
  

const recipeByID = async (req, res, next, id) => {
  try {
    let recipe = await Recipe.findById(id)
    if (!recipe)
      return res.status(400).json({
        error: "Recipe not found"
      })
    req.recipe = recipe
    next()
  } catch (err) {
    return res.status(400).json({
      error: "Could not retrieve recipe"
    })
  }
}

const updateRecipe = async (req, res) => {
  const form = formidable({
    keepExtensions: true,
    multiples: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded"
      });
    }

    let recipe = req.recipe;

    Object.keys(fields).forEach(key => {
      let value = fields[key];
   
      if (Array.isArray(value) && value.length === 1) {
        value = value[0];
      }
  
      if (['preptime', 'cooktime', 'servings'].includes(key) && value === 'null') {
        value = null;
      }

      if (['preptime', 'cooktime', 'servings'].includes(key) && value !== null) {
        value = Number(value);
      }
      recipe[key] = value;
    });

    recipe.updated = Date.now();

    if (files.image && files.image.length > 0) {
      const file = files.image[0];
      recipe.image.data = fs.readFileSync(file.filepath);
      recipe.image.contentType = file.mimetype;
    }

    try {
      let result = await recipe.save();
      res.json(result);
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      });
    }
  });
};


const deleteRecipe = async (req, res) => {
  try {
    let recipe = req.recipe;
    if (!recipe) {
      return res.status(404).json({
        error: "Recipe not found"
      });
    }
    
    if (recipe.creator !== req.auth.name) {
      return res.status(403).json({
        error: "User is not authorized to delete this recipe"
      });
    }

    await Recipe.findByIdAndDelete(recipe._id);
    res.json({ message: "Recipe deleted successfully" });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    });
  }
};

const photo = (req, res, next) => {
  if (req.recipe.image.data) {
    res.set("Content-Type", req.recipe.image.contentType);
    return res.send(req.recipe.image.data);
  }
  next();
};
const defaultPhoto = (req, res) => {
  return res.sendFile(process.cwd()+'../src/assets/defaultFoodImage.png')
};

const read = (req, res) => {
  return res.json(req.recipe)
}

export default { createRecipe, getAllRecipes, updateRecipe, deleteRecipe, read, defaultPhoto, photo, recipeByID};