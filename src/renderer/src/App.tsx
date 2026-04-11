import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { StartupCheck } from './screens/StartupCheck';

export default function App() {
  const [isSystemReady, setIsSystemReady] = useState(false);

  if (!isSystemReady) {
    return <StartupCheck onComplete={() => setIsSystemReady(true)} />;
  }

  return <RouterProvider router={router} />;
}