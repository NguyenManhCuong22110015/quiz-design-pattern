import React, { useState, useEffect } from "react";
import "./MotivationalDecorator.css";

const POSITIVE_MSGS = [
    "Tuyệt vời! Bạn làm rất tốt!",
    "Chính xác! Tiếp tục phát huy nhé!",
    "Bạn thật xuất sắc!",
];
const ENCOURAGE_MSGS = [
    "Đừng nản, thử lại nhé!",
    "Sai một lần không sao, bạn sẽ làm được!",
    "Cố lên, bạn sẽ thành công!",
];

const MotivationalDecorator = ({ isCorrect }) => {
    const [msg, setMsg] = useState("");
    useEffect(() => {
        if (isCorrect === undefined) return;
        const arr = isCorrect ? POSITIVE_MSGS : ENCOURAGE_MSGS;
        setMsg(arr[Math.floor(Math.random() * arr.length)]);
    }, [isCorrect]);
    if (isCorrect === undefined) return null;
    return <div className={`motivational-msg ${isCorrect ? "correct" : "wrong"}`}>{msg}</div>;
};

export default MotivationalDecorator;