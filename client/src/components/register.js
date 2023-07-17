import React, { useState } from 'react';
import { registerUser } from '../api/accounts';
import { Link, redirect, useNavigate  } from 'react-router-dom';

const Register = () => {

    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [firstName, setFirstName] = useState();
    const [lastName, setLastName] = useState();

    const [registerMessage, setRegisterMessage] = useState();

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault()



        //Call the API for "/login", on POST, with formData as the body:
        const response = await registerUser({
            email,
            password,
            firstName,
            lastName
        });
        if(response.status == 201){
            navigate("/login", { replace: true });
        } else {
            setRegisterMessage(response.msg);
        }
        
    }


    return (
        <div>
            <h2>Register page</h2>
        <form method="POST" onSubmit={handleSubmit}>
            <label htmlFor="email">Email:</label>
            <input 
                id='email'
                type="email" 
                name='email'
                placehodler="abc@yahoo.com"
                onChange={e => setEmail(e.target.value)}
                required/>
            <br/>

            <label htmlFor="password">Password:</label>
            <input 
                id='password'
                type="password"
                name="password"
                onChange={e => setPassword(e.target.value)}
                required/>
            <br/>

            <label htmlFor='first-name'>First Name:</label>
            <input
                id='first-name'
                type='text'
                name="firstName"
                onChange = {e => setFirstName(e.target.value)} />
            <br/>

            <label htmlFor='last-name'>Last Name:</label>
            <input
                id='last-name'
                type='text'
                name="firstName"
                onChange = {e => setLastName(e.target.value)} />


            <input type="submit" value="Register" />
            <Link to="/login">Login</Link>
        </form>
            <p>{registerMessage ? registerMessage : ""}</p>
        </div>
    )
}

export default Register;