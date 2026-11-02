import React,{useEffect} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {fetchAllOrders} from '../../redux/slices/orderSlice';
import {fetchProducts} from '../../redux/slices/productSlice';
import {fmt} from '../../utils/helpers';
import StatusChip from '../../components/common/StatusChip';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
export default function AdminDashboard() {
  const dispatch=useDispatch();
  const {allOrders,loading}=useSelector(s=>s.orders);
  const {total:totalProducts}=useSelector(s=>s.products);
  const [stats,setStats]=React.useState(null);
  useEffect(()=>{dispatch(fetchAllOrders({limit:10}));dispatch(fetchProducts({limit:1}));API.get('/admin/stats').then(r=>setStats(r.data));},[dispatch]);
  const s=stats;
  if(!s) return <Loader text="Loading dashboard…"/>;
  return <div style={{padding:28}}>
    <h1 style={{fontSize:24,fontWeight:800,marginBottom:24}}>Dashboard</h1>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
      {[{l:'Total Revenue',v:`₹${((s.totalRevenue||0)/100000).toFixed(1)}L`,e:'💰',c:'#2874f0',bg:'#e3f2fd'},{l:'Total Orders',v:(s.totalOrders||0).toLocaleString(),e:'📦',c:'#388e3c',bg:'#e8f5e9'},{l:'Products',v:(s.totalProducts||0).toString(),e:'🛍️',c:'#ff9f00',bg:'#fff8e1'},{l:'Customers',v:(s.totalUsers||0).toLocaleString(),e:'👥',c:'#ff6161',bg:'#fce4ec'}].map(card=>(
        <div key={card.l} style={{background:'#fff',borderRadius:8,padding:20,boxShadow:'0 1px 4px rgba(0,0,0,.08)'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
            <span style={{fontSize:13,color:'#878787',fontWeight:600}}>{card.l}</span>
            <div style={{width:40,height:40,background:card.bg,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{card.e}</div>
          </div>
          <div style={{fontSize:28,fontWeight:900,color:'#212121'}}>{card.v}</div>
        </div>
      ))}
    </div>
    <div style={{background:'#fff',borderRadius:8,padding:24,boxShadow:'0 1px 4px rgba(0,0,0,.08)'}}>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:20}}>Recent Orders</h3>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr style={{background:'#f9f9f9'}}>{['Order ID','Customer','Amount','Status','Date'].map(h=><th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:12,fontWeight:700,color:'#878787',textTransform:'uppercase',letterSpacing:.5,borderBottom:'2px solid #f0f0f0'}}>{h}</th>)}</tr></thead>
        <tbody>{(s.recentOrders||[]).map(o=><tr key={o._id} style={{borderBottom:'1px solid #f5f5f5'}} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
          <td style={{padding:'13px 16px',fontSize:12,fontWeight:700,color:'#2874f0'}}>{o._id?.slice(-8).toUpperCase()}</td>
          <td style={{padding:'13px 16px',fontSize:14}}>{o.user?.name||'—'}</td>
          <td style={{padding:'13px 16px',fontSize:14,fontWeight:700}}>{fmt(o.totalPrice)}</td>
          <td style={{padding:'13px 16px'}}><StatusChip status={o.orderStatus}/></td>
          <td style={{padding:'13px 16px',fontSize:13,color:'#878787'}}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}
