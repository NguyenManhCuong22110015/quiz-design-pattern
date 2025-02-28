import React from "react";
import { Card } from "react-bootstrap";
import { BsGrid } from "react-icons/bs"; // Bootstrap Icons
import "../../styles/Card.css";
const CustomCard = ({ title, text, icon: Icon, size = "lg" }) => {
  return (
    <Card
      className="custom-card p-3"
      style={{
        maxWidth: size === "lg" ? "400px" : size === "sm" ? "250px" : "320px",
      }}
    >
      <div className="icon-container">
        {Icon && <Icon size={30} color="#000" />}
      </div>
      <div>
        <h5 className="fw-bold">{title}</h5>
        <p className="m-0">{text}</p>
      </div>
    </Card>
  );
};
export default CustomCard;