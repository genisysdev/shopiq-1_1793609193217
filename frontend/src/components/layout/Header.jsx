import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { CATS } from '../../utils/helpers';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector(s => s.auth);
  const { items } = useSelector(s => s.cart);
  const cartCount = items.reduce((s, i) => s + (i.quantity || 0), 0);

  const [q, setQ] = useState('');
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Derive active category from URL
  const activeCat = new URLSearchParams(location.search).get('category') || '';

  const handleSearch = e => {
    e.preventDefault();
    if (q.trim()) navigate(`/products?search=${encodeURIComponent(q.trim())}`);
  };

  const goCategory = cat => {
    // Navigate with timestamp to force ProductsPage re-init when same category re-clicked
    navigate(`/products${cat ? `?category=${encodeURIComponent(cat)}` : ''}`);
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>

      {/* ── Main blue bar ───────────────────────────────────── */}
      <div style={{ background: '#2874f0', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'baseline', gap: 2, flexShrink: 0 }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: '#fff' }}>shop</span>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: '#ffe500' }}>IQ</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,.65)', marginLeft: 3 }}>Explore Plus ▾</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', maxWidth: 620 }}>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search for products, brands and more"
            style={{ flex: 1, padding: '10px 16px', border: 'none', borderRadius: '4px 0 0 4px', fontSize: 14, outline: 'none' }}
          />
          <button type="submit"
            style={{ background: '#ffe500', border: 'none', padding: '0 20px', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}>
            <svg width={20} height={20} fill="none" stroke="#2874f0" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        {/* Right nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginLeft: 'auto' }}>

          {/* User dropdown */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button onClick={() => setMenu(m => !m)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#ffe500', color: '#2874f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900 }}>
                {userInfo?.name?.[0]?.toUpperCase() || '?'}
              </div>
              {userInfo ? (userInfo.name || userInfo.email || "User").split(' ')[0] : 'Login'}
              <span style={{ fontSize: 10 }}>▾</span>
            </button>

            {menu && (
              <div style={{ position: 'absolute', top: '120%', right: 0, background: '#fff', borderRadius: 4, boxShadow: '0 8px 30px rgba(0,0,0,.15)', minWidth: 210, zIndex: 200, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                {!userInfo && (
                  <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
                    <Link to="/login" onClick={() => setMenu(false)}
                      style={{ display: 'block', background: '#2874f0', color: '#fff', textAlign: 'center', padding: '10px 0', borderRadius: 4, fontSize: 14, fontWeight: 700 }}>
                      Login
                    </Link>
                    <p style={{ textAlign: 'center', fontSize: 13, marginTop: 10, color: '#555' }}>
                      New? <Link to="/register" onClick={() => setMenu(false)} style={{ color: '#2874f0', fontWeight: 600 }}>Register</Link>
                    </p>
                  </div>
                )}
                {[
                  { l: 'My Profile', to: '/profile', e: '👤' },
                  { l: 'My Orders', to: '/orders', e: '📦' },
                  { l: 'Wishlist', to: '/wishlist', e: '💝' },
                  ...(userInfo?.role === 'admin' ? [{ l: 'Admin Panel', to: '/admin', e: '⚙️' }] : []),
                ].map(item => (
                  <Link key={item.l} to={item.to} onClick={() => setMenu(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontSize: 14, color: '#333', borderBottom: '1px solid #f5f5f5' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    {item.e} {item.l}
                  </Link>
                ))}
                {userInfo && (
                  <button onClick={() => { dispatch(logout()); setMenu(false); navigate('/'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', background: 'none', border: 'none', fontSize: 14, color: '#ff6161', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    🚪 Logout
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link to="/cart"
            style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 14, fontWeight: 600 }}>
            <svg width={22} height={22} fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            Cart
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: -8, right: -8, background: '#ff9f00', color: '#fff', fontSize: 10, fontWeight: 900, minWidth: 18, height: 18, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ── Category bar ────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', overflowX: 'auto', padding: '0 20px' }}>
        {CATS.map(c => {
          const val = c === 'All' ? '' : c;
          const isActive = activeCat === val && location.pathname === '/products';
          return (
            <button
              key={c}
              onClick={() => goCategory(val)}
              style={{
                padding: '11px 18px',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '3px solid #2874f0' : '3px solid transparent',
                fontSize: 13,
                fontWeight: isActive ? 700 : 600,
                color: isActive ? '#2874f0' : '#333',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all .15s',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#2874f0'; e.currentTarget.style.borderBottomColor = '#2874f0'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#333'; e.currentTarget.style.borderBottomColor = 'transparent'; } }}
            >
              {c}
            </button>
          );
        })}
      </div>

    </header>
  );
}
