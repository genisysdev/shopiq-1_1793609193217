import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { login, register, clearError } from '../redux/slices/authSlice';
import { fetchCart } from '../redux/slices/cartSlice';

export default function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { userInfo, loading, error } = useSelector(s => s.auth);

  const [f, setF] = useState({ email: '', password: '' });

  // After login/register always go to /home
  const from = '/home';

  useEffect(() => {
    // Already logged in → redirect to home
    if (userInfo) navigate(from, { replace: true });
  }, [userInfo, navigate, from]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const submit = async e => {
    e.preventDefault();

    // 1. Try login first
    const loginResult = await dispatch(login({ email: f.email, password: f.password }));

    if (login.fulfilled.match(loginResult)) {
      // Login succeeded
      dispatch(fetchCart());
      toast.success(`Welcome back, ${(loginResult.payload.name || 'there').split(' ')[0]}!`);
      navigate(from, { replace: true });
      return;
    }

    // 2. If user not found / invalid credentials → auto-register
    const errMsg = loginResult.payload || '';
    const isNotFound = errMsg.toLowerCase().includes('invalid') || errMsg.toLowerCase().includes('not found');

    if (isNotFound) {
      // Use email prefix as name for auto-registration
      const name = f.email.split('@')[0];
      const registerResult = await dispatch(register({ name, email: f.email, password: f.password }));

      if (register.fulfilled.match(registerResult)) {
        dispatch(fetchCart());
        toast.success(`Account created! Welcome, ${(registerResult.payload.name || 'there').split(' ')[0]}!`);
        navigate(from, { replace: true });
      }
      // register failure will show via the error useEffect above
    }
    // other login errors (e.g. wrong password) show via error useEffect
  };

  const inp = {
    width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0',
    borderRadius: 4, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    marginBottom: 14, fontFamily: "'DM Sans',sans-serif",
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f3f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.1)', maxWidth: 800, width: '100%' }}>

        {/* Left panel */}
        <div style={{ background: 'linear-gradient(135deg,#2874f0,#1a237e)', padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 10 }}>
            shop<span style={{ color: '#ffe500' }}>IQ</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 16, lineHeight: 1.7 }}>
            Get access to your Orders, Wishlist and Recommendations
          </p>
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['📦 Track your Orders', '💝 Manage Wishlist', '⚡ Faster Checkout', '🎟️ Exclusive Offers'].map(t => (
              <span key={t} style={{ color: 'rgba(255,255,255,.85)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ padding: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, color: '#212121', fontFamily: "'DM Sans',sans-serif" }}>Login</h2>
          <p style={{ fontSize: 13, color: '#878787', marginBottom: 28, fontFamily: "'DM Sans',sans-serif" }}>
            Welcome back! Please sign in to continue.
          </p>

          <form onSubmit={submit}>
            <label style={{ fontSize: 12, color: '#878787', display: 'block', marginBottom: 5, fontFamily: "'DM Sans',sans-serif" }}>Email Address</label>
            <input
              type="email" required
              value={f.email}
              onChange={e => setF({ ...f, email: e.target.value })}
              placeholder="priya@example.com"
              style={inp}
            />

            <label style={{ fontSize: 12, color: '#878787', display: 'block', marginBottom: 5, fontFamily: "'DM Sans',sans-serif" }}>Password</label>
            <input
              type="password" required
              value={f.password}
              onChange={e => setF({ ...f, password: e.target.value })}
              placeholder="Min 6 characters"
              style={inp}
            />

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px 0', background: '#fb641b', color: '#fff', border: 'none', borderRadius: 4, fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 16, fontFamily: "'DM Sans',sans-serif", letterSpacing: .5, opacity: loading ? .8 : 1 }}>
              {loading ? 'Logging in…' : 'LOGIN'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#555', fontFamily: "'DM Sans',sans-serif" }}>
            New to ShopIQ? <Link to="/register" style={{ color: '#2874f0', fontWeight: 700 }}>Create Account</Link>
          </p>

          {/* Demo credentials */}
          <div style={{ marginTop: 24, padding: 14, background: '#f9f9f9', borderRadius: 6, fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#555', lineHeight: 1.8 }}>
            <strong style={{ color: '#212121' }}>Demo credentials:</strong><br />
            Admin: admin@shopiq.com / Admin@1234<br />
            Customer: priya@example.com / User@1234
          </div>
        </div>
      </div>
    </div>
  );
}