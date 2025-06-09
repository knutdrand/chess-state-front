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
import axios from 'axios';
import { apiUrl } from '../config';

function ImportStudyModal({ open, onClose, courseId, token, onAddChapter }) {
  const [studyId, setStudyId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImportStudy = async () => {
    if (studyId && courseId) {
      setLoading(true);
      
      try {
        const headers = { 
          'accept': 'application/json', 
          'Authorization': `Bearer ${token}` 
        };
        
        const response = await axios.post(
          `${apiUrl}/courses/${courseId}/study`,
          { study_id: studyId },
          { headers }
        );
        
        onAddChapter(response.data);
        onClose();
        setStudyId('');
      } catch (error) {
        console.error('Error adding chapter:', error);
        // Display an error message to the user
        alert('Error adding chapter. Please try again.');
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
