import React from "react";

import {Link} from 'react-router-dom';


export default function Header() {

    return (
        <div>
            <ul>
                <li>
                    <Link to='/'>Home</Link> 
                </li>
                <li>
                    <Link to='/dolls'>Dolls</Link> 
                </li>
                <li className="login">
                    <Link to='/login'>Login</Link> 
                    <Link to='/register'>Register</Link> 
                </li>
            </ul>
            

        </div>
    )
}