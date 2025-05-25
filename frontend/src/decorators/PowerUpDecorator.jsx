import React, { useState } from "react";
import "./PowerUpDecorator.css";

const PowerUpDecorator = ({ onPowerUp }) => {
    const [active, setActive] = useState("");

    const handleClick = (type) => {
        setActive(type);
        onPowerUp(type);
        setTimeout(() => setActive(""), 400); // hiệu ứng 400ms
    };

    return (
        <div style={{ margin: "12px 0" }}>
            <button
                className={`powerup-btn${active === "5050" ? " active" : ""}`}
                onClick={() => handleClick("5050")}
                disabled={!!active}
            >
                50:50
            </button>
            <button
                className={`powerup-btn${active === "extraTime" ? " active" : ""}`}
                onClick={() => handleClick("extraTime")}
                disabled={!!active}
            >
                + Thêm thời gian
            </button>
        </div>
    );
};

export default PowerUpDecorator;