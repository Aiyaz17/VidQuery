import React, { useEffect, useState } from "react";
import "./Navbar.css";
import { Grid, List, ListItem, Box } from "@mui/material";

import { HashLink as Link } from "react-router-hash-link";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset;
      if (position > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Box>
      <Grid className={`${!scrolled && "not-scrolled"} navbar-outer-container`}>
        <Grid className="navbar-container">
          <List className="nav-section">
            <Link to="/">
              <ListItem className="logo">VidQuery</ListItem>
            </Link>
          </List>

          <Grid sx={{ flexGrow: 1 }} />

          <List className="nav-section">
            <Link to="/">
              <ListItem>Home</ListItem>
            </Link>
          </List>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Navbar;
