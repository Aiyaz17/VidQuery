import React from "react";
import { Grid, Typography } from "@mui/material";
import "./Footer.css";

const Footer = () => {
  return (
    <Grid className="footer-container" id="footer">
      <Typography
        variant="subtitle"
        sx={{ opacity: "0.9", fontSize: "1.1rem" }}
      >
        qureshi.aiyaz123@gmail.com
      </Typography>
      <Typography variant="subtitle2" sx={{ opacity: "0.5", mt: 0.4 }}>
        © Aiyaz Qureshi. All rights reserved.
      </Typography>
    </Grid>
  );
};

export default Footer;
