import { useEffect } from 'react';

import AppRouter from '@/routes/AppRouter';
import useAuthStore from '@/store/authStore';

function App() {
  const syncAuthFromStorage = useAuthStore((state) => state.syncAuthFromStorage);

  useEffect(() => {
    void syncAuthFromStorage().catch(() => {
      return null;
    });
  }, [syncAuthFromStorage]);

  return <AppRouter />;
}

export default App;
