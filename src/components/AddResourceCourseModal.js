import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { apiUrl } from '../config';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';

function AddResourceCourseModal({ open, onClose, onCourseAdded }) {
  const token = useAuthStore((s) => s.token);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [adding, setAdding] = useState(false);

  const { data: availableCourses = [], isLoading } = useQuery(
    ['available-courses'],
    async () => {
      const response = await axios.get(`${apiUrl}/available-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    { enabled: open && !!token }
  );

  const handleAdd = async () => {
    if (!selectedCourse) return;
    setAdding(true);
    try {
      const response = await axios.post(
        `${apiUrl}/add-resource-course`,
        { folder_name: selectedCourse.folder_name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onCourseAdded(response.data);
      onClose();
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error adding resource course:', error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Built-in Course</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <CircularProgress />
        ) : availableCourses.length === 0 ? (
          <Typography color="text.secondary">No courses available</Typography>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {availableCourses.map((course) => (
              <ListItemButton
                key={course.folder_name}
                selected={selectedCourse?.folder_name === course.folder_name}
                onClick={() => setSelectedCourse(course)}
              >
                <ListItemText primary={course.folder_name} />
                <Chip
                  label={course.color}
                  size="small"
                  color={course.color === 'white' ? 'default' : 'primary'}
                  variant="outlined"
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={!selectedCourse || adding}
        >
          {adding ? 'Adding...' : 'Add Course'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddResourceCourseModal;
