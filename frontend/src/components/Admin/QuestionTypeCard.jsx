import React from "react";
import { Card, Button } from "react-bootstrap";

const QuestionTypeCard = ({ title, description, imgSrc, onSelect }) => (
  <Card className="shadow-sm text-center">
    <Card.Body>
      <Card.Title className="fw-semibold text-dark">{title}</Card.Title>
      <div className="d-flex flex-column align-items-center">
        <img src={imgSrc} alt={title} className="mb-2" />
        <Card.Text className="text-muted">{description}</Card.Text>
        <Button variant="outline-success" onClick={onSelect}>
          Select
        </Button>
      </div>
    </Card.Body>
  </Card>
);

export default QuestionTypeCard;
