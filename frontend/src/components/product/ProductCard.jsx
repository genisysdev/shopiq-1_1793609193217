import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/authSlice';
import { fmt, pct } from '../../utils/helpers';
import Badge from '../common/Badge';

const ProductCard = React.memo(({ product:p }) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(s=>s.auth);
  const { items } = useSelector(s=>s.cart);
  const inCart = items.some(i=>(i.product?._id||i.product)===p._id);
  const inWish = userInfo?.wishlist?.map(String)?.includes(p._id);
  const disc = pct(p.originalPrice, p.price);

  const addCart = useCallback(e=>{ e.preventDefault(); if(!p.countInStock) return;
    dispatch(addToCart({productId:p._id,quantity:1})).unwrap().then(()=>toast.success(`${p.name.slice(0,30)} added!`)).catch(e=>toast.error(e));
  },[dispatch,p]);

  const wish = useCallback(e=>{ e.preventDefault(); if(!userInfo) return toast.info('Please login first');
    dispatch(toggleWishlist(p._id)).unwrap().then(()=>toast.success(inWish?'Removed from wishlist':'Added to wishlist!')).catch(()=>toast.error('Failed'));
  },[dispatch,p._id,userInfo,inWish]);

  return (
    <div style={{background:'#fff',border:'1px solid #f0f0f0',borderRadius:4,overflow:'hidden',position:'relative',transition:'box-shadow .2s,transform .2s'}}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,.12)';e.currentTarget.style.transform='translateY(-2px)'}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='translateY(0)'}}>
      {/* Wishlist */}
      <button onClick={wish} style={{position:'absolute',top:8,right:8,zIndex:2,background:'#fff',border:'none',borderRadius:'50%',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 1px 4px rgba(0,0,0,.15)'}}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill={inWish?'#ff6161':'none'} stroke={inWish?'#ff6161':'#999'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
      </button>
      {/* Image */}
      <Link to={`/product/${p.slug}`} style={{display:'block',background:'#f5f5f5',height:200,overflow:'hidden'}}>
        <img src={p.images?.[0]?.url} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .3s'}} loading="lazy"
          onMouseEnter={e=>e.currentTarget.style.transform='scale(1.06)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}/>
      </Link>
      <div style={{padding:'12px 14px 0'}}>
        <div style={{fontSize:11,color:'#878787',fontWeight:600,textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>{p.brand}</div>
        <Link to={`/product/${p.slug}`} style={{textDecoration:'none'}}>
          <div style={{fontSize:14,fontWeight:500,color:'#212121',marginBottom:6,lineHeight:1.4,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{p.name}</div>
        </Link>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
          <span style={{background:'#388e3c',color:'#fff',fontSize:11,fontWeight:700,padding:'2px 6px',borderRadius:3,display:'flex',alignItems:'center',gap:2}}>
            {p.rating?.toFixed(1)} ★
          </span>
          <span style={{fontSize:12,color:'#878787'}}>({p.numReviews?.toLocaleString('en-IN')})</span>
        </div>
        <div style={{display:'flex',alignItems:'baseline',gap:6,flexWrap:'wrap',marginBottom:8}}>
          <span style={{fontSize:17,fontWeight:800,color:'#212121'}}>{fmt(p.price)}</span>
          {p.originalPrice>p.price && <><span style={{fontSize:12,color:'#878787',textDecoration:'line-through'}}>{fmt(p.originalPrice)}</span><span style={{fontSize:13,color:'#388e3c',fontWeight:700}}>{disc}% off</span></>}
        </div>
        {p.badge && <div style={{marginBottom:10}}><Badge text={p.badge}/></div>}
      </div>
      <div style={{padding:'0 14px 14px'}}>
        <button onClick={addCart} disabled={!p.countInStock}
          style={{width:'100%',padding:'9px 0',background:!p.countInStock?'#e0e0e0':inCart?'#fff8e1':'#ff9f00',color:!p.countInStock?'#9e9e9e':inCart?'#ff9f00':'#fff',border:inCart?'1.5px solid #ff9f00':'none',borderRadius:4,fontSize:13,fontWeight:700,cursor:!p.countInStock?'not-allowed':'pointer',letterSpacing:.3}}>
          {!p.countInStock?'OUT OF STOCK':inCart?'✓ ADDED TO CART':'ADD TO CART'}
        </button>
      </div>
    </div>
  );
});
export default ProductCard;
