import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// Drops index.html's critical boot CSS now that styled-components has injected
// the real styles. Those rules are scoped to html.booting precisely so they stop
// applying here -- left on, they'd keep overriding component text colors.
// The #boot-loader rules are deliberately unscoped, so the title card survives
// this and keeps its styling until __dismissBoot fades it out.
document.documentElement.classList.remove('booting');

// Fades out the opening title card in index.html. It lives outside #root, so
// mounting doesn't remove it -- it has to be dismissed explicitly. On the home
// page it enforces its own minimum hold before fading.
if (window.__dismissBoot) window.__dismissBoot();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();