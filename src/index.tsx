import { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { restoreNativeState, startNative } from './native/init';
import { LoadingFallback } from './components/LoadingFallback';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const ExplorationPreview = lazy(() => import('./features/exploration/ExplorationPreview'));

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Exploration preview mode: `npm run dev:exploration-preview`
const isPreviewMode = import.meta.env.VITE_PREVIEW === 'true';

async function start() {
  // In the iOS/Android apps, restore the saved login before the auth store loads.
  await restoreNativeState();
  const [{ default: App }, { useAuthStore }, { useUiStore }] = await Promise.all([
    import('./App'),
    import('./stores/authStore'),
    import('./stores/uiStore'),
  ]);

  root.render(
    //<React.StrictMode>
      isPreviewMode ? (
        <Suspense fallback={<LoadingFallback />}>
          <ExplorationPreview />
        </Suspense>
      ) : <App />
    //</React.StrictMode>
  );

  void startNative({
    subscribeToken: (listener) =>
      useAuthStore.subscribe((state, prev) => {
        if (state.token !== prev.token) listener(state.token);
      }),
    goToPlayTab: () => {
      const { activeTab, setActiveTab } = useUiStore.getState();
      if (activeTab === 'play') return false;
      setActiveTab('play');
      return true;
    },
  });
}

void start();
