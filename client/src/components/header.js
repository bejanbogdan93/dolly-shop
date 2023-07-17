import React from "react";
import {Link, useNavigate} from 'react-router-dom';
import {useIsAuthenticated, useSignOut} from 'react-auth-kit';


export default function Header({login}) {
    const isAuthenticated = useIsAuthenticated()
    const signOut = useSignOut();
    const navigate = useNavigate();

    const handleSignOut = () => {
        signOut();
        navigate('/');
    }

    return (
        <div>
            <ul>
                <li>
                    <Link to='/'>Home</Link> 
                </li>
                <li>
                    <Link to='/dolls'>Dolls</Link> 
                </li>
                { isAuthenticated() && 
                    <li>
                        <Link to='/cart'>View Cart</Link>
                    </li> 
                }
                
                <li className="login">
                    {isAuthenticated() ? <button onClick={handleSignOut}>Sign Out</button> : <Link to='/login'>Login</Link>}
                </li>
            </ul>
            

        </div>
    )
}