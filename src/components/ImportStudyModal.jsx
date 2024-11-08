import { useState } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { apiUrl } from '../config';

function ImportStudyModal({ show, onHide, onAddChapter, headers, selectedCourse }) {
  const [studyId, setStudyId] = useState(null);
  const [loading, setLoading] = useState(false);  // New loading state

  const handleImportStudy = async () => {
    if (studyId && selectedCourse) {
      //TODO
      setLoading(true);  // Set loading to true before the API call
      const formData = new FormData();
      try {
        console.log('selectedCourse.id', selectedCourse.id)
        console.log('studyId', studyId)
        const response = await axios.post(
          `${apiUrl}/courses/${selectedCourse.id}/study`,

            {'study_id': studyId},
          { headers }
        );
        onAddChapter(response.data);
      } catch (error) {
        console.error('Error adding chapter:', error);
        // Display an error message to the user
        alert('Error adding chapter. Please try again.');
      } finally {
        setLoading(false);  // Set loading to false after the API call completes
      }
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Import Study</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Study ID (8 characters)</Form.Label>
            <Form.Control
                type="text"
                value={studyId}
                onChange={(e) => setStudyId(e.target.value)}
            />
        </Form.Group>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={handleImportStudy} disabled={loading}>
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

export default ImportStudyModal;
