import React, { useState } from 'react';
import { loginUser } from '../api/accounts';
import { Link, useNavigate } from 'react-router-dom';
import { ReactSession } from 'react-client-session';

const Login = ({setLogin}) => {

    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [loginMessage, setLoginMessage] = useState();

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
            setLogin();
            // console.log(ReactSession.get("user"));
            // console.log(document.cookie);

            navigate('/', {
                replace: true, 
                // state: ReactSession.get("email") 
            }); //If using replace: true, the navigation will replace the current entry in the history stack instead of adding a new one.
        } else {
            setLoginMessage(response.msg);
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
            <p>{loginMessage ? loginMessage : ""}</p>
        </div>
    )
}

export default Login;