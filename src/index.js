import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ExplorationPreview from './components/ExplorationPreview';
import reportWebVitals from './reportWebVitals';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Check if we're in preview mode
const isPreviewMode = process.env.REACT_APP_PREVIEW === 'true';

root.render(
  //<React.StrictMode>
    isPreviewMode ? <ExplorationPreview /> : <App />
  //</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
