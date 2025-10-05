import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  CircularProgress,
  Box
} from '@mui/material';
import { DefaultService } from '../api';

function ImportStudyModal({ open, onClose, courseId, token, onAddChapter }) {
  const [studyId, setStudyId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImportStudy = async () => {
    if (studyId && courseId) {
      setLoading(true);
      
      try {
        const response = await DefaultService.addStudyApiCoursesCourseIdStudyPost(
          courseId,
          { study_id: studyId }
        );
        
        onAddChapter(response);
        onClose();
        setStudyId('');
      } catch (error) {
        console.error('Error adding chapter:', error);
        console.error('Error details:', error.body);
        console.error('Error status:', error.status);
        // Display an error message to the user
        const errorMessage = error.status === 401 
          ? 'Authentication failed. Please log in again.'
          : `Error adding chapter: ${error.body?.detail || error.message}. Please try again.`;
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Import Study from Lichess</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="studyId"
          label="Lichess Study ID"
          type="text"
          fullWidth
          variant="outlined"
          value={studyId}
          onChange={(e) => setStudyId(e.target.value)}
          disabled={loading}
          helperText="Enter the ID from the Lichess study URL (e.g., for https://lichess.org/study/abcd1234, enter 'abcd1234')"
          sx={{ mb: 2, mt: 1 }}
        />
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleImportStudy} 
          color="primary" 
          variant="contained"
          disabled={!studyId || loading}
        >
          Import Study
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImportStudyModal;
