import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import store from './redux/store';
import { fetchCart } from './redux/slices/cartSlice';
import Header from './components/layout/Header';
import Loader from './components/common/Loader';
import AdminSidebar from './components/admin/AdminSidebar';

const HomePage          = lazy(() => import('./pages/HomePage'));
const ProductsPage      = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage          = lazy(() => import('./pages/CartPage'));
const CheckoutPage      = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage        = lazy(() => import('./pages/OrdersPage'));
const WishlistPage      = lazy(() => import('./pages/WishlistPage'));
const ProfilePage       = lazy(() => import('./pages/ProfilePage'));
const LoginPage         = lazy(() => import('./pages/LoginPage'));
const RegisterPage      = lazy(() => import('./pages/RegisterPage'));
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts     = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders       = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers        = lazy(() => import('./pages/admin/AdminUsers'));

// PrivateRoute: reads directly from localStorage so it never
// flickers to /login during store hydration.
const PrivateRoute = () => {
  const location = window.location;
  const raw = localStorage.getItem('userInfo');
  const userInfo = raw ? JSON.parse(raw) : null;
  if (userInfo) return <Outlet />;
  return <Navigate to="/login" state={{ from: { pathname: location.pathname } }} replace />;
};

const AdminRoute = () => {
  const raw = localStorage.getItem('userInfo');
  const userInfo = raw ? JSON.parse(raw) : null;
  return userInfo?.role === 'admin' ? <Outlet /> : <Navigate to="/home" replace />;
};

const AdminLayout = () => (
  <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f3f6' }}>
    <AdminSidebar />
    <main style={{ flex: 1, overflowY: 'auto' }}>
      <Suspense fallback={<Loader />}><Outlet /></Suspense>
    </main>
  </div>
);

const MainLayout = () => (
  <>
    <Header />
    <main>
      <Suspense fallback={<Loader />}><Outlet /></Suspense>
    </main>
  </>
);

function AppInit() {
  const dispatch = useDispatch();
  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <AppInit />
      <ToastContainer position="top-right" autoClose={3000} theme="light" style={{ zIndex: 99999 }} />
      <Routes>

        {/* Auth pages — NO header, NO layout wrapper */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Suspense fallback={<Loader />}><LoginPage /></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<Loader />}><RegisterPage /></Suspense>} />

        {/* Main app — with Header */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />

          {/* Private — guarded by localStorage check */}
          <Route element={<PrivateRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}