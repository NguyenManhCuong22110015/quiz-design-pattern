import { useState } from 'react';
import axios from 'axios';
import { checkAuthLogin } from '../../api/LoginAPi';
const CheckAuth = () => {
    const [message, setMessage] = useState('');

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await checkAuthLogin(token);
            setMessage(res.data.message);
        } catch (error) {
            setMessage('Bạn chưa đăng nhập hoặc token hết hạn');
        }
    };

    return (
        <div>
            <button onClick={checkAuth}>Kiểm tra đăng nhập</button>
            <p>{message}</p>
        </div>
    );
};

export default CheckAuth;
