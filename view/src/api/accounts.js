import { API_ENDPOINT } from '.';

export const registerUser = async (User) => {
    return fetch(`${API_ENDPOINT}/users/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(User),
    }).then(data => data.json());
}

export const loginUser = async (loginData) => {
    return fetch(`${API_ENDPOINT}/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(loginData),
    }).then(data => data.json());
    
    
}