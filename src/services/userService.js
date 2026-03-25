import axios from 'axios';

// Creating a reusable function
export const getUserInfo = async (userId, token) => {
    // const token = localStorage.getItem('token');

    const response = await axios.get(`http://localhost:9100/api/user/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response;
};