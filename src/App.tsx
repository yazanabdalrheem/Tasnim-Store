import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import BookExam from "./pages/BookExam";
import AskTasnim from "./pages/AskTasnim";
import AccountLayout from "./pages/account/AccountLayout";
import AccountDashboard from "./pages/account/AccountDashboard";
import MyBookings from "./pages/account/MyBookings";
import MyOrders from "./pages/account/MyOrders";
import MyQuestions from "./pages/account/MyQuestions";
import Wishlist from "./pages/account/Wishlist";
import Promotions from "./pages/admin/Promotions";
import PromotionEditor from "./pages/admin/PromotionEditor";
import ProfileSettings from "./pages/account/ProfileSettings";
import Cart from "./pages/Cart";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ResetPassword from "./pages/auth/ResetPassword";
import About from "./pages/About";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./components/layout/AdminLayout";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Appointments from "./pages/admin/Appointments";
import Orders from "./pages/admin/Orders";
import ContentManager from "./pages/admin/ContentManager";
import Settings from "./pages/admin/Settings";
import Notifications from "./pages/admin/Notifications";
import FAQManager from "./pages/admin/FAQManager";
import Coupons from "./pages/admin/Coupons";
import Users from "./pages/admin/Users";
import Checkout from "./pages/Checkout";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";


import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="book-exam" element={<BookExam />} />
          <Route path="booking" element={<BookExam />} />
          <Route path="ask" element={<AskTasnim />} />
          <Route path="about" element={<About />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="account" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
            <Route index element={<AccountDashboard />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="questions" element={<MyQuestions />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="profile" element={<ProfileSettings />} />
          </Route>
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/reset" element={<ResetPassword />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />

        {/* Admin Routes - Protected */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="orders" element={<Orders />} />
            <Route path="content" element={<ContentManager />} />
            <Route path="faq" element={<FAQManager />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="promotions" element={<Promotions />} />
            <Route path="promotions/:id" element={<PromotionEditor />} />
            <Route path="users" element={<Users />} />

            {/* Add more admin sub-routes here later */}
          </Route>
        </Route>
      </Routes>
    </>
  );
}
