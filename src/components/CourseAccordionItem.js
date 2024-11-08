import { Accordion, Card, ListGroup, Button } from 'react-bootstrap';

function CourseAccordionItem({ course, index, onAddChapter, onDeleteCourse, onDeleteChapter, onToggleChapterEnabled}) {
  return (
    <Accordion.Item eventKey={String(index)}>
      <Accordion.Header>
        {course.name} ({course.color})
        <Button variant="warning" size="sm" className="ml-3" onClick={() => onDeleteCourse(course.id)}>
          Del
        </Button>
      </Accordion.Header>
        <Accordion.Body>
        <h5>Chapters</h5>
        <ListGroup className="mt-3">
          {course.chapters && course.chapters.length > 0 ? (
            course.chapters.map(chapter => (
              <ListGroup.Item key={chapter.id}>{chapter.name}
                <Button variant="warning" size="sm" onClick={() => onDeleteChapter(course.id, chapter.id)}>
                  Del
                </Button>
                <Button
                  variant={chapter.enabled ? "success" : "secondary"}
                  size="sm"
                  className="ml-2"
                  onClick={() => onToggleChapterEnabled(course.id, chapter.id, !chapter.enabled)}
                >
                  {chapter.enabled ? "Disable" : "Enable"}
                </Button>
              </ListGroup.Item>
            ))
          ) : (
            <p>No chapters available</p>
          )}
        </ListGroup>
        <Button className="mt-3" onClick={onAddChapter}>
          Add Chapter
        </Button>
      </Accordion.Body>
    </Accordion.Item>
  );
}

export default CourseAccordionItem;
