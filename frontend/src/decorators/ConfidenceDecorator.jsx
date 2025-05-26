import React, { useState } from "react";
import "./ConfidenceDecorator.css";

const ConfidenceDecorator = ({ baseScore = 10, onMultiplierChange }) => {
    const [multiplier, setMultiplier] = useState(1);

    const handleChange = (e) => {
        const value = Number(e.target.value);
        setMultiplier(value);
        onMultiplierChange && onMultiplierChange(value);
    };

    return (
        <div className="confidence-decorator">
            <label htmlFor="confidence-slider">
                Độ tự tin: <b>{multiplier}x</b>
            </label>
            <input
                id="confidence-slider"
                type="range"
                min={1}
                max={3}
                step={1}
                value={multiplier}
                onChange={handleChange}
                className="confidence-slider"
            />
            <div className="confidence-labels">
                <span>1x</span>
                <span>2x</span>
                <span>3x</span>
            </div>
            <div>
                <i>Điểm thưởng nếu đúng: {baseScore * multiplier} | Sai: 0</i>
            </div>
        </div>
    );
};

export default ConfidenceDecorator;