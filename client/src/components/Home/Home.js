import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  InputAdornment,
  FormControl,
  Typography,
  OutlinedInput,
  IconButton,
  Link,
  CircularProgress,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import baseUrl from "../../baseUrl";

//Icons
import SendIcon from "@mui/icons-material/Send";
import LinkIcon from "@mui/icons-material/Link";

// Styles
import "./Home.css";

const Home = () => {
  const [link, setLink] = useState("");
  const [videoCards, setVideoCards] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseurl = baseUrl();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${baseurl}/api/list-videos`)
      .then((res) => {
        console.log(res.data.data);
        setVideoCards(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function isValidYoutubeLink(link) {
    // The regex pattern to match valid YouTube video URLs
    const pattern =
      /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/(?:watch\?v=|embed\/)?([a-zA-Z0-9_-]{11})$/;
    return pattern.test(link);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    console.log(link);
    try {
      if (isValidYoutubeLink(link)) {
        axios
          .post(`${baseurl}/api/transcript`, { url: link })
          .then((res) => {
            console.log(res);

            if (res.data.status === "success") {
              setLink("");
              const title = res.data.data.savedVideoTranscript.title;
              setIsSubmitting(false);
              navigate(`/qna/${title}`, {
                state: {
                  toastMessage: "Video added successfully!",
                  videoData: res.data.data.savedVideoTranscript,
                },
              });
            } else {
              toast.error("Error adding video");
              throw new Error("Error adding video");
            }
          })
          .catch((err) => {
            console.log(err);
            toast.error("Error adding video");
            setIsSubmitting(false);
            throw new Error("Error adding video");
          });
      } else {
        toast.error("Please enter a valid YouTube video link");
        throw new Error("Please enter a valid YouTube video link");
      }
    } catch (err) {
      console.log(err);
      setIsSubmitting(false);
    }
  };

  const VideoCard = ({ data }) => {
    return (
      <Box className="video-card" sx={{ display: "flex" }}>
        <Box className="video-card-image">
          <img src={data.thumbnail} alt="video thumbnail" />
        </Box>
        <Box className="video-card-details">
          <Typography variant="h5" sx={{ opacity: "0.65" }}>
            {data.title}
          </Typography>
          <Typography
            className="description"
            variant="body2"
            sx={{ opacity: "0.7" }}
          >
            {data.description}
          </Typography>

          <Box className="video-links">
            <RouterLink
              sx={{ width: "100%" }}
              to={`/qna/${data.title}`}
              state={{ videoData: data }}
            >
              <Button variant="outlined">Ask Now</Button>
            </RouterLink>

            <Link
              href={data.videoUrl}
              target="_blank"
              style={{ zIndex: "100" }}
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="outlined">Watch video</Button>
            </Link>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box
      className="home-container"
      sx={{
        minHeight: "90vh",
        mt: "25vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Box className="link-input-container">
        <Typography variant="h5" sx={{ opacity: "0.75", mb: 4 }}>
          Enter a YouTube video link to get started
        </Typography>

        <FormControl component="form" onSubmit={handleSubmit}>
          <OutlinedInput
            id="video-link-input"
            placeholder="Enter YouTube Video Link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            fullWidth
            variant="outlined"
            startAdornment={
              <InputAdornment position="start">
                <LinkIcon />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <CircularProgress size={24} /> : <SendIcon />}
                </IconButton>
              </InputAdornment>
            }
            sx={{
              borderRadius: "20px",
              width: "500px",
              maxWidth: "90vw",
            }}
          />
          <ToastContainer />
        </FormControl>
      </Box>

      <Box className="existing-videos-container" sx={{ mt: 20, width: "100%" }}>
        <Typography variant="h5" sx={{ opacity: "0.6", mb: 4 }}>
          Or Ask a Question on Existing Videos
        </Typography>
        <Box className="existing-videos-innercontainer" sx={{ width: "100%" }}>
          {videoCards.map((videoCard, key) => {
            return (
              <RouterLink
                to={`/qna/${videoCard.title}`}
                className="video-card-link"
                state={{ videoData: videoCard }}
                key={key}
              >
                <VideoCard key={key} data={videoCard} />;{/* </RouterLink> */}
              </RouterLink>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
