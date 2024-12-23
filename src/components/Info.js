import {Alert, Button} from "react-bootstrap";
import React from "react";

export function Info({mode, feedback, width, link, onExplanation}) {
    const text = mode === 'show' ? `Correct move was: ${feedback}` : 'Repeat the move';
    const variant = mode === 'show' ? 'danger' : 'warning';

    function getElement() {
        // check if is a link (starts with http or https):
        //print link
        console.log(link);
        if (link && (typeof link === 'string') && link.startsWith('http')) {
            return <Alert.Link href={link} target="_blank" rel="noopener noreferrer">View in Chessable</Alert.Link>;
        } else {
            return <div> {link} </div>;
        }
    }

    return (
        <Alert variant={variant} style={{width: width}}>
            {text} - {getElement()}
            <Button width={width*0.2} onClick={onExplanation}>Explanation</Button>
        </Alert>
    );
}