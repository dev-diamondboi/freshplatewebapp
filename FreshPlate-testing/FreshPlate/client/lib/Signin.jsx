import React, { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Grid, 
  Box
} from "@mui/material";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { signin } from "./api-auth.js";
import auth from "./auth-helper";

const useStyles = {
  card: {
    maxWidth: 600,
    margin: "auto",
    textAlign: "center",
    paddingBottom: 2,
  },
  error: {
    verticalAlign: "middle",
  },
  title: {
    marginTop: 2,
    color: "#FF6E1C",
  },
  textField: {
    marginLeft: 1,
    marginRight: 1,
    width: 300,
  },
  submit: {
    margin: "auto",
    marginBottom: 2,
  },
};

export default function Signin() {
  const [values, setValues] = useState({
    email: "",
    password: "",
    error: "",
    redirectToReferrer: false,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const clickRegister = () => {
    navigate("/signup");
  };

  const clickSubmit = () => {
    const user = {
      email: values.email || undefined,
      password: values.password || undefined,
    };

    signin(user).then((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error });
      } else {
        auth.authenticate(data, () => {
          setValues({ ...values, error: "", redirectToReferrer: true });
        });
      }
    });
  };

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const { from } = location.state || {
    from: {
      pathname: "/member",
    },
  };

  const { redirectToReferrer } = values;
  if (redirectToReferrer) {
    return <Navigate to={from} />;
  }

  if (values.redirectToReferrer) {
    return <Navigate to={from} />;
  }

  return (
    <div style={{ backgroundColor: "#FFF4EA", height: "100vh" }}>
      <Grid container spacing={0} sx={{ maxWidth: '100%'}}>
        <Card sx={useStyles.card}>
          <CardContent>
            <Typography variant="h6" sx={useStyles.title}>
              Login
            </Typography>
            <TextField
              id="email"
              type="email"
              label="Email"
              sx={useStyles.textField}
              value={values.email}
              onChange={handleChange("email")}
              margin="normal"
            />
            <br />
            <TextField
              id="password"
              type="password"
              label="Password"
              sx={useStyles.textField}
              value={values.password}
              onChange={handleChange("password")}
              margin="normal"
            />
            <br />
            {values.error && (
              <Typography component="p" color="error">
                {values.error}
              </Typography>
            )}
            <br />
            <Button
              color="#000000"
              variant="contained"
              onClick={clickSubmit}
              sx={useStyles.submit}
            >
              Login
            </Button>
            <Button
              color="#000000"
              variant="contained"
              onClick={clickRegister}
              sx={useStyles.submit}
            >
              Register
            </Button>
            <Typography component="p" color="#000000">
              Don't have an account? <Link to="/signup">Join Now</Link>
            </Typography>
          </CardContent>
        </Card>
        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box
            component="img"
            sx={{
              maxWidth: '100%',
              width: '100%',
              height: '100vh',
              objectFit: 'cover',
            }}
            alt="Healthy food"
            src="../src/assets/login-signup.jpeg"
          />
        </Grid>
      </Grid>
    </div>
  );
}
