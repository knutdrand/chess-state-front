import { Container, Button, Card, Image } from 'react-bootstrap';
import React, { useRef } from 'react';

export default function MenuBar({ setToken }) {
    const fileInputRef = useRef(null);

    // Function to handle file input click
    const handleFileUploadClick = () => {
        fileInputRef.current.click(); // Trigger click on the hidden file input
    };

    // Function to handle file selection
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log('File selected:', file);
            // Perform further actions with the selected file
        }
    };

    return (
        <Container>
            <Card>
                <Card.Body>
                    <div className="text-center mb-4">
                        <Image src="/logo192.png" alt="Chess-State Logo" width={64} height={64} />
                    </div>
                    <Card.Title className="text-center">Chess-State</Card.Title>
                    <Button onClick={() => setToken(null)}>Logout</Button>
                    {/* Button to trigger file upload */}
                    <Button className="ml-2" onClick={handleFileUploadClick}>Upload File</Button>
                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </Card.Body>
            </Card>
        </Container>
    );
}
