import React from "react";
import { Typography, Container, Box } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        height:"auto",
        bgcolor: "#FFFFFF",
        py: 4,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          gutterBottom
        >
          &copy; {new Date().getFullYear()} Tasty Recipes. All rights reserved.
        </Typography>
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            style={{ textAlign: "center" }}
          >
            This Website is Designed by{" "}
            <img
              style={{ height: 70, width: "auto", verticalAlign: "middle" }}
              src="../src/assets/teamlogo.png"
              alt="Pseudo Squad Logo"
            />
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
