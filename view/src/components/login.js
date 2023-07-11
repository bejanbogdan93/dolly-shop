import React, { useState } from 'react';
import { loginUser } from '../api/accounts';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {

    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [login, setLogin] = useState();

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault()
        //Call the API for "/login", on POST, with formData as the body:
        const response = await loginUser({
            email,
            password
        });
        console.log(response);
        if(response.status == 200){
            navigate('/', {replace: true});
        } else {
            setLogin(response.msg);
        }
        
    }


    return (
        <div>
            <h2>Login page</h2>
        <form method="POST" onSubmit={handleSubmit}>
            <label htmlFor="email">Email:</label>
            <input type="email" 
                name='email'
                placehodler="abc@yahoo.com"
                onChange={e => setEmail(e.target.value)}/>
            <br/>
            <label htmlFor="password">Password:</label>
            <input 
                type="password"
                name="password"
                onChange={e => setPassword(e.target.value)}/>

            <input type="submit" value="Login" />
            <Link to="/register">Register</Link>
        </form>
            <p>{login ? login : ""}</p>
        </div>
    )
}

export default Login;