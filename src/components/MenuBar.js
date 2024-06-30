import { Container, Form, Button, Alert, Card, Image } from 'react-bootstrap';
import React, { useState } from 'react';

export default function MenuBar({setToken}) {
    return (
        <Container>
            <Card>
                <Card.Body>
                    <div className="text-center mb-4">
                        <Image src="/logo192.png" alt="Chess-State Logo" width={64} height={64} />
                    </div>
                    <Card.Title className="text-center">Chess-State</Card.Title>
                    <Button onClick={setToken(null)}>Logout</Button>
                </Card.Body>
            </Card>
        </Container>
    );
}

