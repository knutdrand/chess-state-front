import { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LoadingFallback } from './components/LoadingFallback';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const ExplorationPreview = lazy(() => import('./features/exploration/ExplorationPreview'));

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Exploration preview mode: `npm run dev:exploration-preview`
const isPreviewMode = import.meta.env.VITE_PREVIEW === 'true';

root.render(
  //<React.StrictMode>
    isPreviewMode ? (
      <Suspense fallback={<LoadingFallback />}>
        <ExplorationPreview />
      </Suspense>
    ) : <App />
  //</React.StrictMode>
);
