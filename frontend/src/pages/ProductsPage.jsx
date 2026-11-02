import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import Loader from '../components/common/Loader';
import { CATS } from '../utils/helpers';

const SORT_OPTS = [
  ['popular',    'Popularity'],
  ['newest',     'Newest First'],
  ['price_asc',  'Price: Low → High'],
  ['price_desc', 'Price: High → Low'],
  ['rating',     'Top Rated'],
  ['discount',   'Best Discount'],
];

export default function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();   // ← also get setter
  const { items, loading, total, pages } = useSelector(s => s.products);

  const [sort,      setSort]      = useState('popular');
  const [minPrice,  setMinPrice]  = useState('');
  const [maxPrice,  setMaxPrice]  = useState('');
  const [minRating, setMinRating] = useState('');
  const [page,      setPage]      = useState(1);
  const [grid,      setGrid]      = useState(true);

  // price debounce
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const priceTimer = useRef(null);

  const handlePriceChange = (field, value) => {
    if (field === 'min') setPriceMin(value);
    else setPriceMax(value);
    clearTimeout(priceTimer.current);
    priceTimer.current = setTimeout(() => {
      if (field === 'min') setMinPrice(value);
      else setMaxPrice(value);
      setPage(1);
    }, 600);
  };

  // read category & search from URL
  const urlCategory = searchParams.get('category') || '';
  const urlSearch   = searchParams.get('search')   || '';

  // ── handle category click → update URL param ──────────────────
  const handleCategoryClick = (cat) => {
    const val = cat === 'All' ? '' : cat;
    const next = new URLSearchParams(searchParams);
    if (val) next.set('category', val);
    else next.delete('category');
    setSearchParams(next);
    setPage(1);
  };

  // fetch whenever any filter or URL param changes
  useEffect(() => {
    const params = {};
    if (urlCategory) params.category  = urlCategory;
    if (urlSearch)   params.search    = urlSearch;
    if (sort)        params.sort      = sort;
    if (minPrice)    params.minPrice  = minPrice;
    if (maxPrice)    params.maxPrice  = maxPrice;
    if (minRating)   params.minRating = minRating;
    if (page > 1)    params.page      = page;
    dispatch(fetchProducts(params));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory, urlSearch, sort, minPrice, maxPrice, minRating, page]);

  const clearFilters = () => {
    setSort('popular');
    setPriceMin(''); setPriceMax('');
    setMinPrice(''); setMaxPrice('');
    setMinRating('');
    setPage(1);
    const next = new URLSearchParams(searchParams);
    next.delete('category');
    setSearchParams(next);
  };

  const inp = {
    padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 4,
    fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div style={{ background: '#f1f3f6', minHeight: '100vh', padding: 16 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>

        {/* ── Sidebar ──────────────────────────────────────── */}
        <div style={{ background: '#fff', borderRadius: 4, padding: 20, height: 'fit-content', boxShadow: '0 1px 4px rgba(0,0,0,.06)', fontFamily: "'DM Sans',sans-serif" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            🔽 FILTERS
            <button onClick={clearFilters}
              style={{ fontSize: 11, color: '#2874f0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: 0 }}>
              Clear All
            </button>
          </div>

          {/* Category — now clickable, updates URL */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#878787', textTransform: 'uppercase', letterSpacing: .6, marginBottom: 10 }}>Category</div>
            {CATS.map(c => {
              const val = c === 'All' ? '' : c;
              const active = urlCategory === val;
              return (
                <div
                  key={c}
                  onClick={() => handleCategoryClick(c)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    marginBottom: 8,
                    cursor: 'pointer',
                    fontSize: 14,
                    color: active ? '#2874f0' : '#444',
                    fontWeight: active ? 700 : 400,
                    userSelect: 'none',
                  }}
                >
                  <span style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${active ? '#2874f0' : '#ccc'}`, background: active ? '#2874f0' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                  </span>
                  {c}
                </div>
              );
            })}
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: 20, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#878787', textTransform: 'uppercase', letterSpacing: .6, marginBottom: 10 }}>Price Range</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input
                value={priceMin}
                onChange={e => handlePriceChange('min', e.target.value)}
                placeholder="Min ₹"
                type="number"
                min="0"
                style={inp}
              />
              <input
                value={priceMax}
                onChange={e => handlePriceChange('max', e.target.value)}
                placeholder="Max ₹"
                type="number"
                min="0"
                style={inp}
              />
            </div>
            {(minPrice || maxPrice) && (
              <div style={{ fontSize: 11, color: '#388e3c', marginTop: 6, fontWeight: 600 }}>
                ₹{minPrice ? Number(minPrice).toLocaleString('en-IN') : '0'} – ₹{maxPrice ? Number(maxPrice).toLocaleString('en-IN') : '∞'}
              </div>
            )}
          </div>

          {/* Rating */}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#878787', textTransform: 'uppercase', letterSpacing: .6, marginBottom: 10 }}>Min Rating</div>
            {[
              { label: '4★ & above', value: '4' },
              { label: '3★ & above', value: '3' },
              { label: '2★ & above', value: '2' },
              { label: 'All Ratings', value: '' },
            ].map(({ label, value }) => (
              <div key={value} onClick={() => { setMinRating(value); setPage(1); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9, cursor: 'pointer', fontSize: 13, color: minRating === value ? '#2874f0' : '#444', fontWeight: minRating === value ? 700 : 400, userSelect: 'none' }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${minRating === value ? '#2874f0' : '#ccc'}`, background: minRating === value ? '#2874f0' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {minRating === value && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                </span>
                <span style={{ color: value ? '#ff9f00' : '#555' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main ─────────────────────────────────────────── */}
        <div>
          {/* Toolbar */}
          <div style={{ background: '#fff', borderRadius: 4, padding: '12px 20px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
            <div style={{ fontSize: 14, color: '#878787', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span>Showing <strong style={{ color: '#212121' }}>{items.length}</strong> of <strong style={{ color: '#212121' }}>{total}</strong></span>
              {urlCategory && (
                <span style={{ background: '#e3f2fd', color: '#2874f0', fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 12 }}>
                  {urlCategory}
                </span>
              )}
              {urlSearch && (
                <span style={{ background: '#fff8e1', color: '#f57f17', fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 12 }}>
                  "{urlSearch}"
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
                style={{ padding: '7px 12px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 13, outline: 'none', cursor: 'pointer', background: '#fff' }}>
                {SORT_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              {[true, false].map(g => (
                <button key={String(g)} onClick={() => setGrid(g)}
                  style={{ width: 34, height: 34, background: grid === g ? '#e3f2fd' : 'none', border: '1px solid #e0e0e0', borderRadius: 4, cursor: 'pointer', fontSize: 16, color: grid === g ? '#2874f0' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {g ? '⊞' : '☰'}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <Loader text="Loading products…" />
          ) : items.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 4, padding: '60px 40px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#212121', marginBottom: 8 }}>No products found</p>
              <p style={{ color: '#878787', marginBottom: 20 }}>Try adjusting your filters or clearing them</p>
              <button onClick={clearFilters}
                style={{ background: '#2874f0', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 4, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: grid ? 'repeat(3,1fr)' : '1fr', gap: 16 }}>
                {items.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
              {pages > 1 && (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
                  {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setPage(n)}
                      style={{ width: 36, height: 36, borderRadius: 4, border: '1px solid #e0e0e0', background: page === n ? '#2874f0' : '#fff', color: page === n ? '#fff' : '#212121', fontWeight: 700, cursor: 'pointer' }}>
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}