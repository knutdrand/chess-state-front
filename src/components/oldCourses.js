import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Grid, 
  Chip, 
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { DefaultService, OpenAPI } from "../api";

export default function Courses({ token }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Configure the API with the token
  useEffect(() => {
    OpenAPI.BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
    OpenAPI.TOKEN = token;
  }, [token]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Use the correct method from DefaultService
      const response = await DefaultService.listCoursesApiListCoursesGet();
      setCourses(response);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setLoading(false);
    }
  };

  const handleStartCourse = async (courseId) => {
    try {
      // This endpoint might not exist in DefaultService
      // You might need to use axios directly for this one
      const response = await fetch(`${OpenAPI.BASE}/api/start-course/${courseId}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setSelectedCourse(data);
    } catch (error) {
      console.error("Error starting course:", error);
    }
  };

  const handleStartChapter = async (chapterId) => {
    try {
      // This endpoint might not exist in DefaultService
      // You might need to use axios directly for this one
      const response = await fetch(`${OpenAPI.BASE}/api/start-chapter/${chapterId}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      // Handle response as needed
    } catch (error) {
      console.error("Error starting chapter:", error);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (selectedCourse) {
    return (
      <Box sx={{ p: 3 }}>
        <Button 
          variant="outlined" 
          onClick={() => setSelectedCourse(null)}
          sx={{ mb: 3 }}
        >
          Back to Courses
        </Button>
        
        <Typography variant="h4" gutterBottom>
          {selectedCourse.title}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {selectedCourse.description}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Progress: {selectedCourse.progress}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={selectedCourse.progress} 
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
        
        <Typography variant="h5" gutterBottom>
          Chapters
        </Typography>
        
        {selectedCourse.chapters.map((chapter) => (
          <Accordion key={chapter.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ width: '33%', flexShrink: 0 }}>
                {chapter.title}
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                {chapter.completed ? 'Completed' : 'In Progress'} - {chapter.positions_count} positions
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                {chapter.description}
              </Typography>
              
              <List>
                {chapter.positions && chapter.positions.map((position, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {position.completed ? 
                        <CheckCircleIcon color="success" /> : 
                        <RadioButtonUncheckedIcon />
                      }
                    </ListItemIcon>
                    <ListItemText 
                      primary={`Position ${index + 1}`} 
                      secondary={position.description || 'No description available'} 
                    />
                  </ListItem>
                ))}
              </List>
              
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => handleStartChapter(chapter.id)}
                sx={{ mt: 2 }}
              >
                {chapter.completed ? 'Review Chapter' : 'Start Chapter'}
              </Button>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Available Courses
      </Typography>
      
      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  {course.title}
                </Typography>
                
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Chip 
                    label={`Level: ${course.level || 'Beginner'}`} 
                    size="small" 
                    sx={{ mr: 1 }} 
                  />
                  <Chip 
                    label={course.category || 'General'} 
                    size="small" 
                    color="primary" 
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {course.description}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Progress: {course.progress || 0}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={course.progress || 0} 
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  variant="contained"
                  onClick={() => handleStartCourse(course.id)}
                >
                  {course.progress > 0 ? 'Continue' : 'Start Course'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
