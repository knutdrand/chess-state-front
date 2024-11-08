import { useState } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { apiUrl } from '../config';

function AddChapterModal({ show, onHide, onAddChapter, headers, selectedCourse }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);  // New loading state

  const handleUploadChapter = async () => {
    if (file && selectedCourse) {
      setLoading(true);  // Set loading to true before the API call
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await axios.post(
          `${apiUrl}/courses/${selectedCourse.id}/chapters`,
          formData,
          { headers }
        );
        onAddChapter(response.data);
      } catch (error) {
        console.error('Error adding chapter:', error);
      } finally {
        setLoading(false);  // Set loading to false after the API call completes
      }
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
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
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={handleUploadChapter} disabled={loading}>
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              /> Uploading...
            </>
          ) : (
            'Upload Chapter'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddChapterModal;
