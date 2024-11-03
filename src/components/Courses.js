import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../config';
import { Accordion, Button } from 'react-bootstrap';
import CourseAccordionItem from './CourseAccordionItem';
import AddCourseModal from './AddCourseModal';
import AddChapterModal from './AddChapterModal';

function Courses({ token }) {
  const [courses, setCourses] = useState([]);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const headers = { 'accept': 'application/json', 'Authorization': `Bearer ${token}` };

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await axios.get(`${apiUrl}/list-courses`, { headers });
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    }
    fetchCourses();
  }, [token]);

  const handleAddCourse = (newCourse) => {
    setCourses([...courses, newCourse]);
    console.log('newCourse:', newCourse);
    setShowAddCourseModal(false);
  };

  const handleAddChapter = (newChapters) => {
    const updatedCourses = courses.map(course =>
      course.id === selectedCourse.id
        ? { ...course, chapters: [...course.chapters, ...newChapters] }
        : course
    );
    setCourses(updatedCourses);
    setShowAddChapterModal(false);
  };
  const handleDeleteCourse = async (courseId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this course?");
    if (!confirmDelete) return;
    try {
      await axios.delete(`${apiUrl}/courses/${courseId}`, { headers });
      setCourses(courses.filter(course => course.id !== courseId));
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const handleDeleteChapter = async (courseId, chapterId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this chapter?");
    if (!confirmDelete) return;
    try {
      await axios.delete(`${apiUrl}/courses/${courseId}/chapters/${chapterId}`, { headers });
      setCourses(prevCourses =>
        prevCourses.map(course =>
          course.id === courseId
            ? { ...course, chapters: course.chapters.filter(chapter => chapter.id !== chapterId) }
            : course
        )
      );
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };



  return (
    <div>
      <h4>Courses</h4>
      <Button className="mt-3" onClick={() => setShowAddCourseModal(true)}>
        Add New Course
      </Button>

      <Accordion defaultActiveKey="0" className="mt-3">
        {courses.map((course, index) => (
          <CourseAccordionItem
            key={course.id}
            course={course}
            index={index}
            onAddChapter={() => { setSelectedCourse(course); setShowAddChapterModal(true); }}
            onDeleteCourse={handleDeleteCourse}
            onDeleteChapter={handleDeleteChapter}
          />
        ))}
      </Accordion>

      <AddCourseModal
        show={showAddCourseModal}
        onHide={() => setShowAddCourseModal(false)}
        onAddCourse={handleAddCourse}
        headers={headers}
      />

      <AddChapterModal
        show={showAddChapterModal}
        onHide={() => setShowAddChapterModal(false)}
        onAddChapter={handleAddChapter}
        headers={headers}
        selectedCourse={selectedCourse}
      />
    </div>
  );
}

export default Courses;
