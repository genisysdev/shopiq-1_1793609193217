import React,{useEffect} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import {fetchMyOrders} from '../redux/slices/orderSlice';
import {fmt} from '../utils/helpers';
import StatusChip from '../components/common/StatusChip';
import Loader from '../components/common/Loader';
export default function OrdersPage() {
  const dispatch=useDispatch();
  const {myOrders,loading}=useSelector(s=>s.orders);
  useEffect(()=>{dispatch(fetchMyOrders());},[dispatch]);
  if(loading) return <Loader text="Loading orders…"/>;
  return <div style={{background:'#f1f3f6',minHeight:'100vh',padding:'16px 0'}}>
    <div style={{maxWidth:900,margin:'0 auto',padding:'0 16px'}}>
      <div style={{background:'#fff',borderRadius:4,padding:'20px 24px',marginBottom:12,boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}><h2 style={{fontSize:18,fontWeight:700,margin:0}}>My Orders</h2></div>
      {myOrders.length===0?<div style={{background:'#fff',borderRadius:4,padding:60,textAlign:'center'}}><div style={{fontSize:60,marginBottom:12}}>📦</div><h3 style={{fontSize:18,marginBottom:8}}>No orders yet</h3><Link to="/products" style={{color:'#2874f0',fontWeight:600}}>Start Shopping</Link></div>
      :myOrders.map(o=><div key={o._id} style={{background:'#fff',borderRadius:4,padding:'20px 24px',marginBottom:8,boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:16,paddingBottom:14,borderBottom:'1px solid #f0f0f0'}}>
          <div><span style={{fontSize:13,color:'#878787'}}>Order ID: </span><span style={{fontSize:13,fontWeight:700,color:'#2874f0'}}>{o._id}</span></div>
          <div style={{display:'flex',gap:8}}><StatusChip status={o.orderStatus}/><StatusChip status={o.paymentStatus}/></div>
        </div>
        {o.items?.slice(0,2).map((item,i)=><div key={i} style={{display:'flex',gap:16,alignItems:'center',marginBottom:10}}>
          <img src={item.image} alt={item.name} style={{width:56,height:56,objectFit:'cover',borderRadius:4,background:'#f5f5f5'}}/>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:'#212121'}}>{item.name}</div><div style={{fontSize:13,color:'#878787'}}>Qty: {item.quantity} × {fmt(item.price)}</div></div>
        </div>)}
        {o.items?.length>2&&<p style={{fontSize:12,color:'#878787',marginBottom:10}}>+{o.items.length-2} more items</p>}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:12,borderTop:'1px solid #f0f0f0'}}>
          <span style={{fontSize:12,color:'#878787'}}>{new Date(o.createdAt).toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'})}</span>
          <span style={{fontSize:16,fontWeight:800,color:'#212121'}}>Total: {fmt(o.totalPrice)}</span>
        </div>
      </div>)}
    </div>
  </div>;
}
