import React from 'react'; 
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
   <React.StrictMode>
  <BrowserRouter>
    <App />
  </BrowserRouter>
  </React.StrictMode>,
)
