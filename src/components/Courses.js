import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../config';
import { Accordion, Card, ListGroup, Form, Modal, Dropdown, Button } from 'react-bootstrap';

function Courses({ token }) {
  const [courses, setCourses] = useState([]);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseColor, setNewCourseColor] = useState('White');
  const [file, setFile] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const headers = {
    'accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };

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

  const handleAddCourse = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/add-course`,
        { name: newCourseName, color: newCourseColor },
        { headers }
      );
      setCourses([...courses, response.data]);
      setShowAddCourseModal(false);
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const handleAddChapter = async () => {
    if (file && selectedCourse) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await axios.post(
          `${apiUrl}/courses/${selectedCourse.id}/chapters`,
          formData,
          { headers }
        );
        const updatedCourses = courses.map(course =>
          course.id === selectedCourse.id
            ? { ...course, chapters: [...course.chapters, response.data] }
            : course
        );
        setCourses(updatedCourses);
        setShowAddChapterModal(false);
      } catch (error) {
        console.error('Error adding chapter:', error);
      }
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
          <Accordion.Item eventKey={String(index)} key={course.id}>
            <Accordion.Header>
              {course.name} ({course.color})
            </Accordion.Header>
            <Accordion.Body>
              <h5>Chapters</h5>
              <ListGroup className="mt-3">
                {course.chapters && course.chapters.length > 0 ? (
                  course.chapters.map(chapter => (
                    <ListGroup.Item key={chapter.id}>{chapter.name}</ListGroup.Item>
                  ))
                ) : (
                  <p>No chapters available</p>
                )}
              </ListGroup>
              <Button className="mt-3" onClick={() => { setSelectedCourse(course); setShowAddChapterModal(true); }}>
                Add Chapter
              </Button>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      {/* Add Course Modal */}
      <Modal show={showAddCourseModal} onHide={() => setShowAddCourseModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Course Name</Form.Label>
            <Form.Control
              type="text"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Player Color</Form.Label>
            <Dropdown onSelect={(eventKey) => setNewCourseColor(eventKey)}>
              <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                {newCourseColor}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item eventKey="White">White</Dropdown.Item>
                <Dropdown.Item eventKey="Black">Black</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddCourseModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddCourse}>Save Course</Button>
        </Modal.Footer>
      </Modal>

      {/* Add Chapter Modal */}
      <Modal show={showAddChapterModal} onHide={() => setShowAddChapterModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Chapter</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Chapter File</Form.Label>
            <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddChapterModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddChapter}>Upload Chapter</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Courses;
