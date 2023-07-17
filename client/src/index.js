import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ReactSession } from 'react-client-session';
import { AuthProvider } from 'react-auth-kit';
import { RequireAuth } from 'react-auth-kit';

import Header from './components/header';
import Home from './components/home';
import Dolls from './components/Dolls';
import Login from './components/login';
import Register from './components/register';
import Cart from "./components/cart";

const root = ReactDOM.createRoot(document.getElementById('root'));


export default function Application() {
  const [login, setLogin] = useState(false);

  const confirmLogin = () => {
    setLogin(true);
  }


  return(
    <React.StrictMode>

      <AuthProvider authType = {'cookie'}
                    authName={'_auth'}
                    cookieDomain={window.location.hostname}
                    cookieSecure={false}>
    
        <BrowserRouter>
        
          <Header login={login}/>
          <Routes>
            <Route path='/'>
              <Route index element={<Home />}></Route>
              <Route path='/cart' element={
                <RequireAuth loginPath={"/login"}>
                  <Cart />
                </RequireAuth>
              }/>
              <Route path='/dolls' element={<Dolls/>} />
              <Route path='/login' element={<Login/>} />
              <Route path='/register' element={<Register />} />
            </Route>
            
          </Routes>
        </BrowserRouter>

      </AuthProvider>

      
    </React.StrictMode>
  )
}

root.render(<Application />);
