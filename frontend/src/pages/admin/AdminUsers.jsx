import React,{useEffect} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {toast} from 'react-toastify';
import API from '../../utils/api';
import Loader from '../../components/common/Loader';
export default function AdminUsers() {
  const [users,setUsers]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const {userInfo}=useSelector(s=>s.auth);
  useEffect(()=>{API.get('/admin/users').then(r=>{setUsers(r.data);setLoading(false);}).catch(()=>setLoading(false));},[]);
  const toggle=async id=>{try{const r=await API.put(`/admin/users/${id}/toggle`);setUsers(us=>us.map(u=>u._id===id?{...u,isActive:r.data.isActive}:u));toast.success('User status updated');}catch(e){toast.error(e.response?.data?.message||'Failed');}};
  if(loading) return <Loader/>;
  return <div style={{padding:28}}>
    <h1 style={{fontSize:24,fontWeight:800,marginBottom:24}}>Users ({users.length})</h1>
    <div style={{background:'#fff',borderRadius:8,boxShadow:'0 1px 4px rgba(0,0,0,.08)',overflow:'hidden'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr style={{background:'#f9f9f9'}}>{['User','Email','Role','Status','Actions'].map(h=><th key={h} style={{padding:'14px 16px',textAlign:'left',fontSize:12,fontWeight:700,color:'#878787',textTransform:'uppercase',letterSpacing:.5,borderBottom:'2px solid #f0f0f0'}}>{h}</th>)}</tr></thead>
        <tbody>{users.map(u=><tr key={u._id} style={{borderBottom:'1px solid #f5f5f5'}} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
          <td style={{padding:'14px 16px'}}><div style={{display:'flex',alignItems:'center',gap:12}}><div style={{width:36,height:36,borderRadius:'50%',background:'#2874f0',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,flexShrink:0}}>{u.name?.[0]?.toUpperCase()}</div><div><div style={{fontSize:14,fontWeight:600}}>{u.name}</div><div style={{fontSize:12,color:'#878787'}}>{u.phone||'—'}</div></div></div></td>
          <td style={{padding:'14px 16px',fontSize:13,color:'#555'}}>{u.email}</td>
          <td style={{padding:'14px 16px'}}><span style={{background:u.role==='admin'?'#ede7f6':'#e3f2fd',color:u.role==='admin'?'#4527a0':'#1565c0',fontSize:11,fontWeight:700,padding:'3px 8px',borderRadius:10}}>{u.role}</span></td>
          <td style={{padding:'14px 16px'}}><span style={{background:u.isActive?'#e8f5e9':'#fce4ec',color:u.isActive?'#2e7d32':'#c62828',fontSize:12,fontWeight:700,padding:'3px 10px',borderRadius:12}}>{u.isActive?'Active':'Inactive'}</span></td>
          <td style={{padding:'14px 16px'}}>{u.role!=='admin'&&u._id!==userInfo?._id&&<button onClick={()=>toggle(u._id)} style={{padding:'7px 14px',background:u.isActive?'#fce4ec':'#e8f5e9',color:u.isActive?'#ff6161':'#388e3c',border:'none',borderRadius:4,fontSize:12,fontWeight:700,cursor:'pointer'}}>{u.isActive?'Deactivate':'Activate'}</button>}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}
