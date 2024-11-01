import { useState } from 'react';
import { Modal, Form, Button, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import { apiUrl } from '../config';

function AddCourseModal({ show, onHide, onAddCourse, headers }) {
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseColor, setNewCourseColor] = useState('White');

  const handleSaveCourse = async () => {
    try {
      let url = `${apiUrl}/add-course`;
      let data = { course_name: newCourseName, color: newCourseColor };
      let config = {headers: headers };
      console.log('data:', data);
      console.log('config', config);
      console.log('url:', url);
      const response = await axios.post(
        url,
        data,
        config
      );
      onAddCourse(response.data);
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
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
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={handleSaveCourse}>Save Course</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddCourseModal;
