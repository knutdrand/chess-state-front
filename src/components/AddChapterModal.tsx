// @ts-nocheck
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useMutation } from "@tanstack/react-query"



function AddChapterModal({ open, onClose, onAddChapter, selectedCourse, token }) {
  const [file, setFile] = useState(null);

  // Mutation for uploading a chapter
  const uploadChapterMutation = useMutation(
    async () => {
      if (!file || !selectedCourse) throw new Error("No file or course selected");
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${apiUrl}/courses/${selectedCourse.id}/chapters`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    },
    {
      onSuccess: (data) => {
        onAddChapter(data); // Update the parent component's state
        onClose(); // Close the modal
      },
      onError: (error) => {
        console.error("Error uploading chapter:", error);
        alert("Error adding chapter. Please try again."); // Display an error message
      },
    }
  );

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUploadChapter = () => {
    uploadChapterMutation.mutate();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Chapter</DialogTitle>
      <DialogContent>
        <TextField
          type="file"
          inputProps={{ accept: ".pgn" }}
          onChange={handleFileChange}
          fullWidth
          helperText="Please upload a .pgn file."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="secondary">
          Close
        </Button>
        <Button
          onClick={handleUploadChapter}
          variant="contained"
          color="primary"
          disabled={uploadChapterMutation.isLoading}
          startIcon={
            uploadChapterMutation.isLoading ? <CircularProgress size={20} /> : null
          }
        >
          {uploadChapterMutation.isLoading ? "Uploading..." : "Upload Chapter"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddChapterModal;
