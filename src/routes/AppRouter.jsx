import { Route, Routes } from 'react-router-dom';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Layout from '@/components/layout/Layout';
import MyPageLayout from '@/components/layout/MyPageLayout';
import AddressManagementPage from '@/components/mypage/AddressManagementPage';
import ClaimHistoryPage from '@/components/mypage/ClaimHistoryPage';
import CouponBenefitsPage from '@/components/mypage/CouponBenefitsPage';
import InquiryHistoryPage from '@/components/mypage/InquiryHistoryPage';
import MyPage from '@/components/mypage/MyPage';
import MyReviewsPage from '@/components/mypage/MyReviewsPage';
import OrderHistoryPage from '@/components/mypage/OrderHistoryPage';
import ProfilePage from '@/components/mypage/ProfilePage';
import WishlistPage from '@/components/mypage/WishlistPage';
import CartPage from '@/pages/CartPage';
import CheckoutComplete from '@/pages/CheckoutComplete';
import CheckoutPage from '@/pages/CheckoutPage';
import CheckoutPage2 from '@/pages/CheckoutPage2';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import ProductPage from '@/pages/ProductPage';
import SignupPage from '@/pages/SignupPage';
import TermsPage from '@/pages/TermsPage';

function withMyPageLayout(page) {
  return <MyPageLayout>{page}</MyPageLayout>;
}

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

        <Route element={<ProtectedRoute />}>
          <Route path="/mypage" element={withMyPageLayout(<MyPage />)} />
          <Route path="/mypage/orders" element={withMyPageLayout(<OrderHistoryPage />)} />
          <Route path="/mypage/claims" element={withMyPageLayout(<ClaimHistoryPage />)} />
          <Route path="/mypage/reviews" element={withMyPageLayout(<MyReviewsPage />)} />
          <Route path="/mypage/coupons" element={withMyPageLayout(<CouponBenefitsPage />)} />
          <Route path="/mypage/profile" element={withMyPageLayout(<ProfilePage />)} />
          <Route path="/mypage/addresses" element={withMyPageLayout(<AddressManagementPage />)} />
          <Route path="/mypage/inquiries" element={withMyPageLayout(<InquiryHistoryPage />)} />
          <Route path="/mypage/wishlist" element={withMyPageLayout(<WishlistPage />)} />
        </Route>
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/terms/:type" element={<TermsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
