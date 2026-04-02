import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
} from '@mui/material';
import httpClient from '../httpClient';

function AddCourseModal({ open, onClose, onAddCourse }) {
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseColor, setNewCourseColor] = useState('White');

  const handleSaveCourse = async () => {
    try {
      const response = await httpClient.post(
        '/api/add-course',
        { course_name: newCourseName, color: newCourseColor }
      );
      
      onAddCourse(response.data);
      onClose();
      // Reset form
      setNewCourseName('');
      setNewCourseColor('White');
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Course</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="courseName"
          label="Course Name"
          type="text"
          fullWidth
          variant="outlined"
          value={newCourseName}
          onChange={(e) => setNewCourseName(e.target.value)}
          sx={{ mb: 2, mt: 1 }}
        />
        
        <FormControl fullWidth variant="outlined">
          <InputLabel id="color-select-label">Color</InputLabel>
          <Select
            labelId="color-select-label"
            id="color-select"
            value={newCourseColor}
            onChange={(e) => setNewCourseColor(e.target.value)}
            label="Color"
          >
            <MenuItem value="White">White</MenuItem>
            <MenuItem value="Black">Black</MenuItem>
            <MenuItem value="Both">Both</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleSaveCourse} 
          color="primary" 
          variant="contained"
          disabled={!newCourseName}
        >
          Add Course
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddCourseModal;
