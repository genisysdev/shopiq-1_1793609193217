import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchBySlug, addReview } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/authSlice';
import { fmt, pct } from '../utils/helpers';
import Loader from '../components/common/Loader';
import { useTracker } from '../hooks/useTracker';
import Badge from '../components/common/Badge';
import StarRating from '../components/common/StarRating';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product: p, loading } = useSelector(s => s.products);
  const { userInfo } = useSelector(s => s.auth);
  const { items } = useSelector(s => s.cart);
  const [img, setImg] = useState(0);
  const { track } = useTracker();
  const [qty, setQty] = useState(1);
  const [rev, setRev] = useState({ rating: 5, comment: '' });

  useEffect(() => { dispatch(fetchBySlug(slug));
    if (slug) track('product_view', { page: window.location.pathname }); setImg(0); setQty(1); }, [slug, dispatch]);

  if (loading || !p) return <Loader text="Loading product…" />;

  const inCart = items.some(i => (i.product?._id || i.product) === p._id);
  const inWish = userInfo?.wishlist?.map(String)?.includes(p._id);
  const disc = pct(p.originalPrice, p.price);

  // ── specs: safely convert from plain object (JSON) or Map ──────────────────
  const getSpecs = () => {
    if (!p.specs) return [];
    // MongoDB Map comes back as a plain JS object after JSON serialization
    if (typeof p.specs === 'object' && !Array.isArray(p.specs)) {
      try {
        // If it's a real Map
        if (p.specs instanceof Map) return [...p.specs];
        // Plain object from JSON
        return Object.entries(p.specs);
      } catch { return []; }
    }
    return [];
  };
  const specEntries = getSpecs();

  const doAdd = () => {
    dispatch(addToCart({ productId: p._id, quantity: qty }))
      .unwrap()
      .then(() => toast.success('Added to cart!'))
      .catch(e => toast.error(e));
  };

  const submitReview = async e => {
    e.preventDefault();
    if (!userInfo) return toast.info('Please login to review');
    try {
      await dispatch(addReview({ id: p._id, data: rev })).unwrap();
      toast.success('Review added!');
      dispatch(fetchBySlug(slug));
    if (slug) track('product_view', { page: window.location.pathname });
      setRev({ rating: 5, comment: '' });
    } catch (e) { toast.error(e); }
  };

  return (
    <div style={{ background: '#f1f3f6', minHeight: '100vh', padding: '16px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13, color: '#878787' }}>
          <Link to="/" style={{ color: '#2874f0' }}>Home</Link> ›
          <Link to={`/products?category=${p.category}`} style={{ color: '#2874f0' }}>{p.category}</Link> ›
          <span style={{ color: '#212121' }}>{p.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '45% 1fr', gap: 20, marginBottom: 20 }}>

          {/* ── Image panel ───────────────────────────────── */}
          <div style={{ background: '#fff', borderRadius: 4, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.06)', position: 'sticky', top: 80, height: 'fit-content' }}>
            <div style={{ background: '#f5f5f5', borderRadius: 8, overflow: 'hidden', marginBottom: 16, aspectRatio: '1' }}>
              <img
                src={p.images?.[img]?.url}
                alt={p.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {p.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
                {p.images.map((im, i) => (
                  <div key={i} onClick={() => setImg(i)}
                    style={{ width: 60, height: 60, border: `2px solid ${i === img ? '#2874f0' : '#e0e0e0'}`, borderRadius: 4, overflow: 'hidden', cursor: 'pointer' }}>
                    <img src={im.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={doAdd} disabled={!p.countInStock}
                style={{ padding: '13px 0', background: !p.countInStock ? '#e0e0e0' : '#ff9f00', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 800, cursor: !p.countInStock ? 'not-allowed' : 'pointer' }}>
                🛒 {inCart ? 'GO TO CART' : 'ADD TO CART'}
              </button>
              <button onClick={() => { doAdd(); navigate('/cart'); }} disabled={!p.countInStock}
                style={{ padding: '13px 0', background: !p.countInStock ? '#e0e0e0' : '#fb641b', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 800, cursor: !p.countInStock ? 'not-allowed' : 'pointer' }}>
                ⚡ BUY NOW
              </button>
            </div>
          </div>

          {/* ── Details panel ─────────────────────────────── */}
          <div style={{ background: '#fff', borderRadius: 4, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
            <div style={{ fontSize: 12, color: '#878787', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>{p.brand}</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#212121', margin: '0 0 12px', lineHeight: 1.3 }}>{p.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ background: '#388e3c', color: '#fff', fontSize: 13, fontWeight: 700, padding: '3px 8px', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                {p.rating?.toFixed(1)} <StarRating rating={p.rating} size={11} />
              </span>
              <span style={{ fontSize: 14, color: '#878787' }}>{p.numReviews?.toLocaleString('en-IN')} ratings</span>
              <span style={{ color: '#ddd' }}>|</span>
              <span style={{ fontSize: 13, color: '#878787' }}>{p.numSold?.toLocaleString('en-IN')} sold</span>
            </div>

            {/* Price */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: '#212121' }}>{fmt(p.price)}</span>
                {p.originalPrice > p.price && <>
                  <span style={{ fontSize: 16, color: '#878787', textDecoration: 'line-through' }}>{fmt(p.originalPrice)}</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#388e3c' }}>{disc}% off</span>
                </>}
              </div>
              {p.originalPrice > p.price && (
                <p style={{ fontSize: 14, color: '#388e3c', fontWeight: 600, marginTop: 4 }}>
                  You save {fmt(p.originalPrice - p.price)}!
                </p>
              )}
            </div>

            {/* Offers */}
            <div style={{ background: '#f9f9f9', borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>Available Offers</div>
              {[
                'Bank Offer: 5% cashback on HDFC Credit Card',
                'No Cost EMI on select cards — 3/6/12 months',
                'Use coupon WELCOME10 for extra 10% off',
              ].map((o, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: '#388e3c' }}>✦</span>{o}
                </div>
              ))}
            </div>

            {p.badge && <div style={{ marginBottom: 16 }}><Badge text={p.badge} /></div>}

            {/* Stock */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: p.countInStock > 0 ? '#388e3c' : '#ff6161' }}>
                {p.countInStock > 10
                  ? '✓ In Stock'
                  : p.countInStock > 0
                    ? `⚠ Only ${p.countInStock} left!`
                    : '✗ Out of Stock'}
              </span>
            </div>

            {/* Qty */}
            {p.countInStock > 0 && (
              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 14, color: '#555' }}>Qty:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 36, height: 36, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>−</button>
                  <span style={{ width: 40, textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                  <button onClick={() => setQty(Math.min(p.countInStock, qty + 1))} style={{ width: 36, height: 36, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>+</button>
                </div>
              </div>
            )}

            {/* Wishlist */}
            <button onClick={() => {
              if (!userInfo) return toast.info('Please login first');
              dispatch(toggleWishlist(p._id)).unwrap()
                .then(() => toast.success(inWish ? 'Removed from wishlist' : 'Added to wishlist!'))
                .catch(() => toast.error('Failed'));
            }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'none', border: '1.5px solid #e0e0e0', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: inWish ? '#ff6161' : '#555', marginBottom: 24 }}>
              {inWish ? '❤️ WISHLISTED' : '🤍 ADD TO WISHLIST'}
            </button>

            {/* Description */}
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Description</h3>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, marginBottom: 20 }}>{p.description}</p>

            {/* Specs — safe iteration over plain object or Map */}
            {specEntries.length > 0 && (
              <>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Specifications</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  {specEntries.map(([k, v], i) => (
                    <tr key={k} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                      <td style={{ fontSize: 13, fontWeight: 600, color: '#878787', padding: '10px 16px', width: '35%' }}>{k}</td>
                      <td style={{ fontSize: 13, color: '#212121', padding: '10px 16px' }}>{v}</td>
                    </tr>
                  ))}
                </table>
              </>
            )}
          </div>
        </div>

        {/* ── Reviews ───────────────────────────────────────── */}
        <div style={{ background: '#fff', borderRadius: 4, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>
            Customer Reviews ({p.numReviews})
          </h2>
          {p.reviews?.length === 0 && (
            <p style={{ color: '#878787' }}>No reviews yet — be the first to review!</p>
          )}
          {p.reviews?.slice(0, 10).map((r, i) => (
            <div key={i} style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>{r.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ background: '#388e3c', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>{r.rating} ★</span>
                  <span style={{ fontSize: 12, color: '#878787' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
              <p style={{ fontSize: 14, color: '#555' }}>{r.comment}</p>
            </div>
          ))}

          {userInfo ? (
            <form onSubmit={submitReview} style={{ marginTop: 24, background: '#f9f9f9', borderRadius: 8, padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Write a Review</h3>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>Your Rating</label>
                <select value={rev.rating} onChange={e => setRev({ ...rev, rating: Number(e.target.value) })}
                  style={{ padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 14, outline: 'none', cursor: 'pointer' }}>
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars {'★'.repeat(n)}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <textarea
                  value={rev.comment}
                  onChange={e => setRev({ ...rev, comment: e.target.value })}
                  rows={3} required
                  placeholder="Share your experience with this product…"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit"
                style={{ background: '#2874f0', color: '#fff', padding: '10px 28px', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Submit Review
              </button>
            </form>
          ) : (
            <div style={{ marginTop: 20, padding: 16, background: '#f9f9f9', borderRadius: 8, textAlign: 'center' }}>
              <Link to="/login" style={{ color: '#2874f0', fontWeight: 700, fontSize: 14 }}>Login to write a review</Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}