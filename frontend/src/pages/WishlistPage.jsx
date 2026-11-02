import React,{useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useDispatch,useSelector} from 'react-redux';
import {fetchProducts} from '../redux/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
export default function WishlistPage() {
  const dispatch=useDispatch();
  const {userInfo}=useSelector(s=>s.auth);
  const {items}=useSelector(s=>s.products);
  const wishIds=(userInfo?.wishlist||[]).map(String);
  const wishlisted=items.filter(p=>wishIds.includes(p._id));
  useEffect(()=>{dispatch(fetchProducts({limit:50}));},[dispatch]);
  return <div style={{background:'#f1f3f6',minHeight:'100vh',padding:'16px 0'}}>
    <div style={{maxWidth:1200,margin:'0 auto',padding:'0 16px'}}>
      <div style={{background:'#fff',borderRadius:4,padding:'20px 24px',marginBottom:16,boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}><h2 style={{fontSize:18,fontWeight:700,margin:0}}>My Wishlist ({wishlisted.length} items)</h2></div>
      {wishlisted.length===0?<div style={{background:'#fff',borderRadius:4,padding:60,textAlign:'center'}}><div style={{fontSize:60,marginBottom:12}}>💝</div><h3 style={{fontSize:18}}>Your wishlist is empty</h3><Link to="/products" style={{color:'#2874f0',fontWeight:600}}>Browse Products</Link></div>
      :<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>{wishlisted.map(p=><ProductCard key={p._id} product={p}/>)}</div>}
    </div>
  </div>;
}
