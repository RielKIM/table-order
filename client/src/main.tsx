import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

/**
 * 단일 SPA 진입점.
 * 최상위에 하나의 BrowserRouter 만 두고, App 에서 경로별로
 * Customer App( '/' ) / Admin App( '/admin' ) 을 분기한다.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
