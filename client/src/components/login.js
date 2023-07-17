import React, { useState } from 'react';
import { loginUser } from '../api/accounts';
import { Link, useNavigate } from 'react-router-dom';
import { useSignIn } from 'react-auth-kit'

const Login = () => {

    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [loginMessage, setLoginMessage] = useState(null);

    const signIn = useSignIn()
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault()
        //Call the API for "/login", on POST, with formData as the body:
        const response = await loginUser({
            email,
            password
        });

        if(response.status == 200){
            if(signIn(
                {
                    token: response.token,
                    expiresIn: 3600,
                    tokenType: "Bearer",
                    authState: email,
                })
            ){
                navigate('/');
            }else{
                setLoginMessage("signIn failed");
            }
            
        }else{
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