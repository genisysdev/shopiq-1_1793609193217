import React,{useEffect,useState} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {toast} from 'react-toastify';
import {fetchAllOrders,updateOrderStatus} from '../../redux/slices/orderSlice';
import {fmt} from '../../utils/helpers';
import StatusChip from '../../components/common/StatusChip';
import Loader from '../../components/common/Loader';
const TRANSITIONS={Pending:['Confirmed','Cancelled'],Confirmed:['Processing','Cancelled'],Processing:['Shipped','Cancelled'],Shipped:['Delivered'],Delivered:[],Cancelled:[],Refunded:[]};
export default function AdminOrders() {
  const dispatch=useDispatch();
  const {allOrders,loading,pages}=useSelector(s=>s.orders);
  const [page,setPage]=useState(1);
  const [statusFilter,setStatusFilter]=useState('');
  const [tracking,setTracking]=useState({});
  useEffect(()=>{dispatch(fetchAllOrders({page,status:statusFilter}));},[dispatch,page,statusFilter]);
  const changeStatus=async(id,status)=>{try{await dispatch(updateOrderStatus({id,status,trackingNumber:tracking[id]})).unwrap();toast.success(`Status → ${status}`);}catch(e){toast.error(e);}};
  if(loading) return <Loader/>;
  return <div style={{padding:28}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
      <h1 style={{fontSize:24,fontWeight:800,margin:0}}>Orders</h1>
      <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{padding:'9px 14px',border:'1px solid #e0e0e0',borderRadius:4,fontSize:13,outline:'none',cursor:'pointer'}}>
        <option value="">All Statuses</option>{['Pending','Confirmed','Processing','Shipped','Delivered','Cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
      </select>
    </div>
    <div style={{background:'#fff',borderRadius:8,boxShadow:'0 1px 4px rgba(0,0,0,.08)',overflow:'hidden'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr style={{background:'#f9f9f9'}}>{['Order ID','Customer','Total','Status','Payment','Change Status','Date'].map(h=><th key={h} style={{padding:'14px 16px',textAlign:'left',fontSize:12,fontWeight:700,color:'#878787',textTransform:'uppercase',letterSpacing:.5,borderBottom:'2px solid #f0f0f0',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
        <tbody>{allOrders.map(o=><tr key={o._id} style={{borderBottom:'1px solid #f5f5f5'}} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
          <td style={{padding:'13px 16px',fontSize:12,fontWeight:700,color:'#2874f0'}}>{o._id?.slice(-8).toUpperCase()}</td>
          <td style={{padding:'13px 16px',fontSize:13}}><div style={{fontWeight:600}}>{o.user?.name||'—'}</div><div style={{fontSize:12,color:'#878787'}}>{o.user?.email}</div></td>
          <td style={{padding:'13px 16px',fontSize:14,fontWeight:700}}>{fmt(o.totalPrice)}</td>
          <td style={{padding:'13px 16px'}}><StatusChip status={o.orderStatus}/></td>
          <td style={{padding:'13px 16px'}}><StatusChip status={o.paymentStatus}/></td>
          <td style={{padding:'13px 16px'}}>
            {(TRANSITIONS[o.orderStatus]||[]).length>0?<div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {(TRANSITIONS[o.orderStatus]||[]).map(s=><button key={s} onClick={()=>changeStatus(o._id,s)} style={{padding:'5px 10px',background:'#f0f4ff',color:'#2874f0',border:'1px solid #2874f0',borderRadius:4,fontSize:11,fontWeight:700,cursor:'pointer'}}>{s}</button>)}
            </div>:<span style={{fontSize:12,color:'#878787'}}>—</span>}
          </td>
          <td style={{padding:'13px 16px',fontSize:13,color:'#878787'}}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
        </tr>)}</tbody>
      </table>
    </div>
    {pages>1&&<div style={{display:'flex',gap:8,justifyContent:'center',marginTop:20}}>{Array.from({length:pages},(_,i)=>i+1).map(n=><button key={n} onClick={()=>setPage(n)} style={{width:36,height:36,borderRadius:4,border:'1px solid #e0e0e0',background:page===n?'#2874f0':'#fff',color:page===n?'#fff':'#212121',fontWeight:700,cursor:'pointer'}}>{n}</button>)}</div>}
  </div>;
}
