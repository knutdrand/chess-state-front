import { Accordion, Card, ListGroup, Button } from 'react-bootstrap';

function CourseAccordionItem({ course, index, onAddChapter, onDeleteCourse, onDeleteChapter, onToggleChapterEnabled, onToggleCourseEnabled, onImportStudy}) {
  return (
    <Accordion.Item eventKey={String(index)}>
      <Accordion.Header>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            {/* Left-aligned content */}
            <span>
              {course.name} ({course.color})
            </span>
            
            {/* Right-aligned buttons */}
            <div>
              <Button
                variant="warning"
                size="sm"
                className="ml-3"
                onClick={() => onDeleteCourse(course.id)}
              >
                Del
              </Button>
              <Button
                variant={course.enabled ? "success" : "secondary"}
                size="sm"
                className="ml-2"
                onClick={() => onToggleCourseEnabled(course.id, !course.enabled)}
              >
                {course.enabled ? "Disable" : "Enable"}
              </Button>
            </div>
          </div>
        </Accordion.Header>
        <Accordion.Body>
        <h5>Chapters</h5>
        <ListGroup className="mt-3">
          {course.chapters && course.chapters.length > 0 ? (
            course.chapters.map(chapter => (
              <ListGroup.Item key={chapter.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Left-aligned chapter name */}
              <span>{chapter.name}</span>
              
              {/* Right-aligned buttons */}
              <div>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => onDeleteChapter(course.id, chapter.id)}
                >
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
              </div>
            </ListGroup.Item>
            ))
          ) : (
            <p>No chapters available</p>
          )}
        </ListGroup>
        <Button className="mt-3" onClick={onAddChapter}>
          Add Chapter
        </Button>
        <Button className="mt-3" onClick={onImportStudy}>
          Import Study
        </Button>
      </Accordion.Body>
    </Accordion.Item>
  );
}

export default CourseAccordionItem;
