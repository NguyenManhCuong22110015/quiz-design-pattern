import React from "react";

const ComboProgressBar = ({ combo }) => (
    <div style={{ margin: "8px 0" }}>
        <div>Combo: {combo}</div>
        <progress value={combo % 3} max={3} style={{ width: "100%" }} />
    </div>
);

export default ComboProgressBar;