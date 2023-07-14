import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ReactSession } from 'react-client-session';
//import reportWebVitals from './reportWebVitals';

import Header from './components/header';
import Home from './components/home';
import Dolls from './components/Dolls';
import Login from './components/login';
import Register from './components/register';

const root = ReactDOM.createRoot(document.getElementById('root'));


export default function Application() {

  const [login, setLogin] = useState(false);

  // ReactSession.setStoreType("cookie");
  // ReactSession.set("testSession", "hello");

  const confirmLogin = () => {
    setLogin(true);
  }


  return(
    <BrowserRouter>
      <Header login={login}/>
      <Routes>
        <Route path='/'>
          <Route index element={<Home />}></Route>
          <Route path='dolls' element={<Dolls/>} />
          <Route path='login' element={<Login setLogin={confirmLogin}/>} />
          <Route path='register' element={<Register />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  )
}

root.render(<Application />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
