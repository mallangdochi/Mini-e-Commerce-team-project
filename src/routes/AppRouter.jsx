import { Routes, Route } from 'react-router-dom';

import Layout from '@/components/layout/Layout';
import CartPage from '@/pages/CartPage';
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

        {/* 상품 판매 페이지 */}
        <Route path="/products" element={<ProductPage />} />

        {/* 상품 상세 페이지 */}
        <Route path="/products/:productId" element={<ProductDetailPage />} />

        <Route path="/cart" element={<CartPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
