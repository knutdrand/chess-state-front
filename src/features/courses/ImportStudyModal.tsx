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
import { DefaultService } from '../../api';
import { useNotification } from '../../hooks/useNotification';

interface ImportStudyModalProps {
  open: boolean;
  onClose: () => void;
  courseId: number | undefined;
  onAddChapter: () => void;
}

function ImportStudyModal({ open, onClose, courseId, onAddChapter }: ImportStudyModalProps) {
  const { notifyError } = useNotification();
  const [studyId, setStudyId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImportStudy = async () => {
    if (studyId && courseId) {
      setLoading(true);
      
      try {
        await DefaultService.addStudyApiCoursesCourseIdStudyPost(
          courseId,
          { study_id: studyId }
        );

        onAddChapter();
        onClose();
        setStudyId('');
      } catch (err: any) {
        console.error('Error adding chapter:', err);
        console.error('Error details:', err.body);
        console.error('Error status:', err.status);
        const errorMessage = err.status === 401
          ? 'Authentication failed. Please log in again.'
          : `Error adding chapter: ${err.body?.detail || err.message}. Please try again.`;
        notifyError(errorMessage);
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
