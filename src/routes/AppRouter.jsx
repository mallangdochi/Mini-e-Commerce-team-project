import { Route, Routes } from 'react-router-dom';

import Layout from '@/components/layout/Layout';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import CheckoutPage2 from '@/pages/CheckoutPage2';
import CheckoutComplete from '@/pages/CheckoutComplete';
import ClaimHistoryPage from '@/pages/ClaimHistoryPage';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import MyPage from '@/pages/MyPage';
import OrderHistoryPage from '@/pages/OrderHistoryPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import ProductPage from '@/pages/ProductPage';
import SignupPage from '@/pages/SignupPage';
import TermsPage from '@/pages/TermsPage';

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

        <Route path="/mypage/orders" element={<OrderHistoryPage />} />

        <Route path="/mypage/claims" element={<ClaimHistoryPage />} />

        <Route path="/mypage/*" element={<MyPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />

      <Route path="/signup" element={<SignupPage />} />

      <Route path="/terms/:type" element={<TermsPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
