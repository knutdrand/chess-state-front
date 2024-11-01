import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, ListGroup, Form, Modal } from 'react-bootstrap';

function Courses({ apiUrl, token }) {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setCourses(['height', 'weight']);
    return;
    async function fetchCourses() {
      try {
        const response = await axios.get(`${apiUrl}/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    }
    fetchCourses();
  }, [apiUrl, token]);

  const handleAddCourse = () => {
    setShowModal(true);
  };

  return (
    <div>
      <Button onClick={handleAddCourse}>Add New Course</Button>
      <ListGroup className="mt-3">
        {courses.map(course => (
          <ListGroup.Item key={course.id}>{course.name}</ListGroup.Item>
        ))}
      </ListGroup>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Form fields for adding a course */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary">Save Course</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Courses;
