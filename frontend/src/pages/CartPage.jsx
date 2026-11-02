import React,{useEffect,useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {useDispatch,useSelector} from 'react-redux';
import {toast} from 'react-toastify';
import {fetchCart,updateQty,removeItem,clearCartAPI,applyCoupon,removeCoupon} from '../redux/slices/cartSlice';
import { useTracker } from '../hooks/useTracker';
import {fmt} from '../utils/helpers';
import Loader from '../components/common/Loader';
export default function CartPage() {
  const { track } = useTracker();
  const dispatch=useDispatch();const navigate=useNavigate();
  const {items,coupon,discountAmount,loading}=useSelector(s=>s.cart);
  const [code,setCode]=useState('');
  useEffect(()=>{dispatch(fetchCart());},[dispatch]);
  if(loading) return <Loader text="Loading cart…"/>;
  const subtotal=items.reduce((s,i)=>s+(i.price||0)*i.quantity,0);
  const shipping=subtotal>=499?0:40;
  const total=subtotal+shipping-(discountAmount||0);
  const applyCp=async()=>{if(!code.trim())return;const r=await dispatch(applyCoupon({code,cartTotal:subtotal}));if(applyCoupon.fulfilled.match(r)){toast.success(`Coupon applied! Save ${fmt(r.payload.discountAmount)}`);setCode('');}else toast.error(r.payload);};
  if(items.length===0) return <div style={{background:'#f1f3f6',minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
    <div style={{background:'#fff',borderRadius:4,padding:'60px 80px',textAlign:'center'}}><div style={{fontSize:80,marginBottom:20}}>🛒</div><h2 style={{fontSize:24,fontWeight:700,marginBottom:8}}>Your cart is empty!</h2><p style={{color:'#878787',marginBottom:24}}>Add items to it now.</p><Link to="/products" style={{background:'#2874f0',color:'#fff',padding:'13px 40px',borderRadius:4,fontSize:15,fontWeight:700}}>Shop Now</Link></div>
  </div>;
  return <div style={{background:'#f1f3f6',minHeight:'100vh',padding:'16px 0'}}>
    <div style={{maxWidth:1200,margin:'0 auto',padding:'0 16px',display:'grid',gridTemplateColumns:'1fr 380px',gap:16}}>
      <div>
        <div style={{background:'#fff',borderRadius:4,padding:'18px 24px',marginBottom:12,display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
          <h2 style={{fontSize:18,fontWeight:700,margin:0}}>My Cart ({items.reduce((s,i)=>s+i.quantity,0)} items)</h2>
          <button onClick={()=>dispatch(clearCartAPI())} style={{background:'none',border:'1px solid #e0e0e0',color:'#878787',padding:'6px 14px',borderRadius:4,fontSize:13,cursor:'pointer'}}>Clear Cart</button>
        </div>
        {items.map(item=>{const prod=item.product;return(
          <div key={item._id||prod?._id} style={{background:'#fff',borderRadius:4,padding:'20px 24px',marginBottom:8,boxShadow:'0 1px 4px rgba(0,0,0,.06)',display:'flex',gap:20}}>
            <Link to={`/product/${prod?.slug}`} style={{width:96,height:96,background:'#f5f5f5',borderRadius:4,overflow:'hidden',flexShrink:0,display:'block'}}><img src={prod?.images?.[0]?.url} alt={prod?.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/></Link>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:'#878787',fontWeight:600,textTransform:'uppercase',marginBottom:4}}>{prod?.brand}</div>
              <Link to={`/product/${prod?.slug}`} style={{fontSize:15,fontWeight:600,color:'#212121',display:'block',marginBottom:8}}>{prod?.name}</Link>
              <div style={{display:'flex',alignItems:'center',gap:16}}>
                <div style={{display:'flex',alignItems:'center',border:'1px solid #e0e0e0',borderRadius:4,overflow:'hidden'}}>
                  <button onClick={()=>dispatch(updateQty({productId:prod?._id,quantity:item.quantity-1}))} style={{width:32,height:32,background:'none',border:'none',fontSize:18,cursor:'pointer'}}>−</button>
                  <span style={{width:36,textAlign:'center',fontWeight:700}}>{item.quantity}</span>
                  <button onClick={()=>dispatch(updateQty({productId:prod?._id,quantity:item.quantity+1}))} style={{width:32,height:32,background:'none',border:'none',fontSize:18,cursor:'pointer'}}>+</button>
                </div>
                <button onClick={()=>dispatch(removeItem(prod?._id))} style={{background:'none',border:'none',color:'#878787',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:4}}>🗑️ Remove</button>
              </div>
            </div>
            <div style={{fontSize:18,fontWeight:800,color:'#212121',flexShrink:0}}>{fmt((item.price||0)*item.quantity)}</div>
          </div>
        );})}
      </div>
      <div style={{height:'fit-content'}}>
        <div style={{background:'#fff',borderRadius:4,padding:20,marginBottom:12,boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>🏷️ Apply Coupon</div>
          {coupon?<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'#e8f5e9',padding:'10px 14px',borderRadius:4}}>
            <div><div style={{fontSize:13,fontWeight:700,color:'#388e3c'}}>✓ {coupon.code}</div><div style={{fontSize:12,color:'#388e3c'}}>Saving {fmt(discountAmount)}</div></div>
            <button onClick={()=>dispatch(removeCoupon())} style={{background:'none',border:'none',color:'#ff6161',cursor:'pointer',fontSize:13,fontWeight:600}}>Remove</button>
          </div>:<div style={{display:'flex',gap:8}}>
            <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="WELCOME10, FLAT200…" style={{flex:1,padding:'10px 12px',border:'1px solid #e0e0e0',borderRadius:4,fontSize:13,outline:'none'}}/>
            <button onClick={applyCp} style={{background:'#2874f0',color:'#fff',border:'none',padding:'0 16px',borderRadius:4,fontSize:13,fontWeight:700,cursor:'pointer'}}>Apply</button>
          </div>}
          <div style={{fontSize:11,color:'#878787',marginTop:8}}>Try: WELCOME10 · FLAT200 · SAVE500 · TECH15</div>
        </div>
        <div style={{background:'#fff',borderRadius:4,padding:20,boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
          <h3 style={{fontSize:13,fontWeight:700,color:'#878787',textTransform:'uppercase',letterSpacing:.5,margin:'0 0 16px'}}>Price Details</h3>
          {[['Price',fmt(subtotal)],['Discount',discountAmount>0?`−${fmt(discountAmount)}`:'−₹0'],['Delivery',shipping===0?'FREE':fmt(shipping)]].map(([l,v])=><div key={l} style={{display:'flex',justifyContent:'space-between',marginBottom:12,fontSize:14}}><span style={{color:'#555'}}>{l}</span><span style={{fontWeight:600,color:l==='Discount'&&discountAmount>0?'#388e3c':'#212121'}}>{v}</span></div>)}
          <div style={{borderTop:'1px dashed #e0e0e0',paddingTop:14,display:'flex',justifyContent:'space-between',fontSize:18,fontWeight:800,color:'#212121'}}><span>Total</span><span>{fmt(total)}</span></div>
          {discountAmount>0&&<p style={{fontSize:13,color:'#388e3c',fontWeight:600,margin:'10px 0 0'}}>🎉 You save {fmt(discountAmount)}!</p>}
          <button onClick={()=>navigate('/checkout')} style={{width:'100%',marginTop:20,padding:'15px 0',background:'#fb641b',color:'#fff',border:'none',borderRadius:4,fontSize:16,fontWeight:800,cursor:'pointer',letterSpacing:.5}}>PLACE ORDER</button>
        </div>
      </div>
    </div>
  </div>;
}