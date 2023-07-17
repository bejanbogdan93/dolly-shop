import React from "react";
import { useSignOut } from 'react-auth-kit';
import { useNavigate } from "react-router-dom";

export default function Cart() {

    const signOut = useSignOut();

    const navigate = useNavigate();

    const handleSignOut = () => {
        signOut();
        navigate('/login');
    }

    return (
        <div>
            Cart only available to these who are logged in!

            <button onClick={handleSignOut}>Sign Out</button>
        </div>
    );
}