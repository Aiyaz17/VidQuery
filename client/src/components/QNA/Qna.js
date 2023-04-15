import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  OutlinedInput,
  CircularProgress,
  Modal,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import baseUrl from "../../baseUrl";
import axios from "axios";

// Icons
import QuestionAnswer from "@mui/icons-material/QuestionAnswer";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";

// Styles
import "./Qna.css";

const QnaPage = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [videoData, setVideoData] = useState({});
  const [showTranscript, setShowTranscript] = useState(false);
  const baseurl = baseUrl();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const message = location.state?.toastMessage;
    setVideoData(location.state?.videoData);

    if (message) {
      toast.success(message);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log(question);
    axios
      .post(`${baseurl}/api/query`, { query: question, id: videoData._id })
      .then((res) => {
        console.log(res.data);
        if (res.data.status === "success") {
          setAnswer(res.data.data);
        } else {
          toast.error("Error Occured while fetching answer");
        }
      })
      .catch((err) => {
        toast.error("Error Occured while fetching answer");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
    setQuestion("");
  };

  const handleOpen = () => {
    setShowTranscript(true);
  };

  const handleClose = () => {
    setShowTranscript(false);
  };

  return (
    <Box className="qna-container" sx={{ p: 3, mt: "15vh" }}>
      {window.scrollTo({ top: 0, behavior: "smooth" })}
      <ToastContainer />

      <Typography variant="h4" sx={{ opacity: "0.8", fontWeight: "bold" }}>
        Ask your Questions here
      </Typography>

      <Box sx={{ mt: 5, mb: 3, textAlign: "center" }}>
        <Typography variant="h6" className="video-title" gutterBottom>
          Video Title: <span> {videoData.title}</span>
        </Typography>

        <Typography
          variant="body2"
          className="show-transcript"
          marginTop={2}
          onClick={handleOpen}
        >
          Show Transcript
        </Typography>

        <Modal
          open={showTranscript}
          onClose={handleClose}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h4" sx={{ opacity: 0.7 }}>
                Transcript
              </Typography>

              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              {videoData.transcript}
            </Typography>
          </Box>
        </Modal>
      </Box>
      <FormControl component="form" onSubmit={handleSubmit}>
        <OutlinedInput
          id="video-link-input"
          placeholder="Enter Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          fullWidth
          variant="outlined"
          startAdornment={
            <InputAdornment position="start">
              <QuestionAnswer />
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
      </FormControl>

      {answer && (
        <Box sx={{ my: 10, textAlign: "left", mr: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Answer
          </Typography>
          <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: "4px" }}>
            <Typography variant="body2" gutterBottom>
              {answer}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default QnaPage;
