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
import { DefaultService } from "../../api";
import { useMutation } from "@tanstack/react-query";
import { useNotification } from "../../hooks/useNotification";

interface AddChapterModalProps {
  open: boolean;
  onClose: () => void;
  onAddChapter: () => void;
  selectedCourse: { id: number; name: string } | null;
}

function AddChapterModal({ open, onClose, onAddChapter, selectedCourse }: AddChapterModalProps) {
  const { notifyError } = useNotification();
  const [file, setFile] = useState<File | null>(null);

  // Mutation for uploading a chapter
  const uploadChapterMutation = useMutation(
    async () => {
      if (!file || !selectedCourse) throw new Error("No file or course selected");
      return DefaultService.addChaptersApiCoursesCourseIdChaptersPost(
        selectedCourse.id,
        { file }
      );
    },
    {
      onSuccess: () => {
        onAddChapter();
        onClose();
      },
      onError: (error) => {
        console.error("Error uploading chapter:", error);
        notifyError("Error adding chapter. Please try again.");
      },
    }
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
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
