import { useState, useEffect } from 'react';
import axios from 'axios';
import {apiUrl} from "../config";
import { Button, ListGroup, Form, Modal, Dropdown } from 'react-bootstrap';

function Courses({ token }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseColor, setNewCourseColor] = useState('White');
  const [file, setFile] = useState(null);
  const headers = {
    'accept': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await axios.get(`${apiUrl}/list-courses`, {
          headers: headers
        });
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    }
    fetchCourses();
  }, [apiUrl, token]);

  const handleAddCourse = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/add-course`,
        { name: newCourseName, color: newCourseColor },
        { headers: headers }
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
          { headers: headers }
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
      {selectedCourse ? (
        <>
          <Button variant="secondary" onClick={() => setSelectedCourse(null)}>
            Back to Courses
          </Button>
          <h4>{selectedCourse.name} - Chapters</h4>
          <ListGroup className="mt-3">
            {selectedCourse.chapters.map(chapter => (
              <ListGroup.Item key={chapter.id}>{chapter.name}</ListGroup.Item>
            ))}
          </ListGroup>
          <Button className="mt-3" onClick={() => setShowAddChapterModal(true)}>
            Add Chapter
          </Button>
        </>
      ) : (
        <>
          <h4>Courses</h4>
          <ListGroup className="mt-3">
            {courses.map(course => (
              <ListGroup.Item key={course.id} onClick={() => setSelectedCourse(course)}>
                {course.name} ({course.color})
              </ListGroup.Item>
            ))}
          </ListGroup>
          <Button className="mt-3" onClick={() => setShowAddCourseModal(true)}>
            Add New Course
          </Button>
        </>
      )}

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
          <Form.Group>
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