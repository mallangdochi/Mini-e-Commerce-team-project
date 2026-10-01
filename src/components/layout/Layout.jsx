import { Outlet } from 'react-router-dom';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import useCartSync from '@/hooks/useCartSync';

function Layout() {
  useCartSync();

  return (
    <div className="site-layout">
      <Header />

      <main className="site-main">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default Layout;
