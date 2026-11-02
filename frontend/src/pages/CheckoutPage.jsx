import React,{useState,useEffect} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {placeOrder,clearOrderState} from '../redux/slices/orderSlice';
import { useTracker } from '../hooks/useTracker';
import {clearCartLocal} from '../redux/slices/cartSlice';
import {fmt} from '../utils/helpers';
export default function CheckoutPage() {
  const { track } = useTracker();
  useEffect(() => { track('checkout_start', { page: '/checkout' }); }, []);
  const dispatch=useDispatch();const navigate=useNavigate();
  const {items,coupon,discountAmount}=useSelector(s=>s.cart);
  const {userInfo}=useSelector(s=>s.auth);
  const {loading,success,error,order}=useSelector(s=>s.orders);
  const [step,setStep]=useState(1);
  const [addr,setAddr]=useState(userInfo?.address||{street:'',city:'',state:'',pincode:''});
  const [payment,setPayment]=useState('upi');
  const subtotal=items.reduce((s,i)=>s+(i.price||0)*i.quantity,0);
  const shipping=subtotal>=499?0:40;
  const total=subtotal+shipping-(discountAmount||0);
  useEffect(()=>{if(!userInfo){navigate('/login');return;}if(items.length===0&&!success)navigate('/cart');},[userInfo,items,navigate,success]);
  useEffect(()=>{if(success){toast.success('Order placed! 🎉');setStep(3);dispatch(clearCartLocal());const t=setTimeout(()=>{dispatch(clearOrderState());navigate('/orders');},3000);return()=>clearTimeout(t);}if(error)toast.error(error);},[success,error,navigate,dispatch]);
  const confirm=()=>{dispatch(placeOrder({items:items.map(i=>({product:i.product?._id||i.product,quantity:i.quantity})),shippingAddress:addr,paymentMethod:payment,couponCode:coupon?.code||null}));};
  const STEPS=['Delivery Address','Payment Method','Confirmation'];
  const inp={width:'100%',padding:'10px 12px',border:'1px solid #e0e0e0',borderRadius:4,fontSize:14,outline:'none',boxSizing:'border-box'};
  return <div style={{background:'#f1f3f6',minHeight:'100vh',padding:'16px 0'}}>
    <div style={{maxWidth:1100,margin:'0 auto',padding:'0 16px',display:'grid',gridTemplateColumns:'1fr 360px',gap:16}}>
      <div>
        {/* Stepper */}
        <div style={{background:'#fff',borderRadius:4,padding:'20px 28px',marginBottom:12,display:'flex',alignItems:'center',boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
          {STEPS.map((s,i)=><React.Fragment key={s}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:step>i+1?'#388e3c':step===i+1?'#2874f0':'#e0e0e0',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:800}}>{step>i+1?'✓':i+1}</div>
              <span style={{fontSize:13,fontWeight:700,color:step===i+1?'#2874f0':step>i+1?'#388e3c':'#878787'}}>{s}</span>
            </div>
            {i<2&&<div style={{flex:1,height:2,background:step>i+1?'#388e3c':'#e0e0e0',margin:'0 16px'}}/>}
          </React.Fragment>)}
        </div>
        {step===1&&<div style={{background:'#fff',borderRadius:4,padding:'24px 28px',boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:20}}>Delivery Address</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            {[['street','Street Address'],['city','City'],['state','State'],['pincode','Pincode']].map(([field,label])=><div key={field}><label style={{fontSize:12,color:'#878787',display:'block',marginBottom:5}}>{label}</label><input value={addr[field]||''} onChange={e=>setAddr({...addr,[field]:e.target.value})} style={inp}/></div>)}
          </div>
          <button onClick={()=>setStep(2)} disabled={!addr.street||!addr.city||!addr.pincode} style={{marginTop:20,background:'#2874f0',color:'#fff',padding:'13px 40px',border:'none',borderRadius:4,fontSize:14,fontWeight:700,cursor:'pointer'}}>DELIVER HERE</button>
        </div>}
        {step===2&&<div style={{background:'#fff',borderRadius:4,padding:'24px 28px',boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:20}}>Payment Method</h3>
          {[{id:'upi',l:'UPI',s:'PhonePe, GPay, Paytm',e:'💳'},{id:'card',l:'Credit / Debit Card',s:'Visa, Mastercard, RuPay',e:'💳'},{id:'netbanking',l:'Net Banking',s:'All major banks',e:'🏦'},{id:'cod',l:'Cash on Delivery',s:'Pay when delivered',e:'💵'}].map(o=>(
            <label key={o.id} style={{display:'flex',alignItems:'center',gap:16,padding:'14px 20px',border:`1.5px solid ${payment===o.id?'#2874f0':'#e0e0e0'}`,borderRadius:4,marginBottom:10,cursor:'pointer',background:payment===o.id?'#f0f4ff':'#fff'}}>
              <input type="radio" name="pay" checked={payment===o.id} onChange={()=>setPayment(o.id)} style={{accentColor:'#2874f0'}}/><span style={{fontSize:22}}>{o.e}</span><div><div style={{fontSize:14,fontWeight:600}}>{o.l}</div><div style={{fontSize:12,color:'#878787'}}>{o.s}</div></div>
            </label>
          ))}
          <button onClick={confirm} disabled={loading} style={{marginTop:10,background:'#fb641b',color:'#fff',padding:'13px 40px',border:'none',borderRadius:4,fontSize:15,fontWeight:800,cursor:'pointer'}}>
            {loading?'Processing…':`CONFIRM ORDER — ${fmt(total)}`}
          </button>
        </div>}
        {step===3&&<div style={{background:'#fff',borderRadius:4,padding:'60px 40px',textAlign:'center',boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
          <div style={{width:80,height:80,background:'#e8f5e9',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:36}}>✓</div>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,marginBottom:8}}>Order Placed!</h2>
          <p style={{color:'#878787',fontSize:15}}>Your order has been placed. Redirecting to orders…</p>
          {order&&<p style={{marginTop:12,fontSize:14,color:'#2874f0',fontWeight:700}}>Order ID: {order._id}</p>}
        </div>}
      </div>
      {/* Summary */}
      <div style={{background:'#fff',borderRadius:4,padding:20,height:'fit-content',boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
        <h3 style={{fontSize:13,fontWeight:700,color:'#878787',textTransform:'uppercase',letterSpacing:.5,margin:'0 0 16px'}}>Order Summary</h3>
        <div style={{maxHeight:280,overflowY:'auto',marginBottom:16}}>
          {items.map(item=><div key={item._id} style={{display:'flex',gap:12,marginBottom:14}}>
            <img src={item.product?.images?.[0]?.url} alt="" style={{width:56,height:56,objectFit:'cover',borderRadius:4,background:'#f5f5f5',flexShrink:0}}/>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:'#212121',lineHeight:1.3}}>{item.product?.name}</div><div style={{fontSize:12,color:'#878787'}}>Qty: {item.quantity}</div><div style={{fontSize:14,fontWeight:700}}>{fmt((item.price||0)*item.quantity)}</div></div>
          </div>)}
        </div>
        <div style={{borderTop:'1px dashed #e0e0e0',paddingTop:14}}>
          {[['Subtotal',fmt(subtotal)],['Discount',discountAmount>0?`−${fmt(discountAmount)}`:'−₹0'],['Delivery',shipping===0?'FREE':fmt(shipping)]].map(([l,v])=><div key={l} style={{display:'flex',justifyContent:'space-between',marginBottom:10,fontSize:13}}><span style={{color:'#555'}}>{l}</span><span>{v}</span></div>)}
          <div style={{display:'flex',justifyContent:'space-between',fontSize:16,fontWeight:800,color:'#212121',borderTop:'1px solid #e0e0e0',paddingTop:10}}><span>Total</span><span>{fmt(total)}</span></div>
        </div>
      </div>
    </div>
  </div>;
}