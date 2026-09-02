import { Route, Routes } from 'react-router-dom';

import Layout from '@/components/layout/Layout';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import CheckoutPage2 from '@/pages/CheckoutPage2';
import CheckoutComplete from '@/pages/CheckoutComplete';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import ProductPage from '@/pages/ProductPage';
import SignupPage from '@/pages/SignupPage';

function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />

        <Route path="/products" element={<ProductPage />} />

        <Route path="/products/:productId" element={<ProductDetailPage />} />

        <Route path="/cart" element={<CartPage />} />

        <Route path="/checkout" element={<CheckoutPage />} />

        <Route path="/checkout2" element={<CheckoutPage2 />} />

        <Route path="/checkout/complete" element={<CheckoutComplete />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />

      <Route path="/signup" element={<SignupPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
