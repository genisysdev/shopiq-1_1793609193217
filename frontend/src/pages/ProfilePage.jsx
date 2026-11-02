import React,{useState} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import {toast} from 'react-toastify';
import {updateProfile} from '../redux/slices/authSlice';
export default function ProfilePage() {
  const dispatch=useDispatch();
  const {userInfo}=useSelector(s=>s.auth);
  const {myOrders}=useSelector(s=>s.orders);
  const [editing,setEditing]=useState(false);
  const [f,setF]=useState({name:userInfo?.name||'',phone:userInfo?.phone||'',...(userInfo?.address||{})});
  const [pw,setPw]=useState({current:'',new:'',confirm:''});
  const save=async e=>{e.preventDefault();try{await dispatch(updateProfile({name:f.name,phone:f.phone,address:{street:f.street,city:f.city,state:f.state,pincode:f.pincode}})).unwrap();toast.success('Profile updated!');setEditing(false);}catch(e){toast.error(e);}};
  const inp={padding:'10px 12px',border:'1px solid #e0e0e0',borderRadius:4,fontSize:14,outline:'none',boxSizing:'border-box',width:'100%',background:'#f9f9f9'};
  const inpE={...inp,border:'1px solid #2874f0',background:'#fff'};
  return <div style={{background:'#f1f3f6',minHeight:'100vh',padding:'16px 0'}}>
    <div style={{maxWidth:800,margin:'0 auto',padding:'0 16px'}}>
      <div style={{background:'#fff',borderRadius:4,padding:32,boxShadow:'0 1px 4px rgba(0,0,0,.06)',marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:28,paddingBottom:28,borderBottom:'1px solid #f0f0f0'}}>
          <div style={{width:72,height:72,borderRadius:'50%',background:'#2874f0',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:900}}>{userInfo?.name?.[0]?.toUpperCase()}</div>
          <div><h2 style={{fontSize:20,fontWeight:800,margin:'0 0 4px'}}>{userInfo?.name}</h2><p style={{fontSize:14,color:'#878787',margin:0}}>{userInfo?.email}</p><span style={{background:userInfo?.role==='admin'?'#ede7f6':'#e3f2fd',color:userInfo?.role==='admin'?'#4527a0':'#1565c0',fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:10}}>{userInfo?.role}</span></div>
          <button onClick={()=>setEditing(!editing)} style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8,padding:'10px 20px',background:editing?'#f0f0f0':'#2874f0',color:editing?'#555':'#fff',border:'none',borderRadius:4,fontSize:13,fontWeight:700,cursor:'pointer'}}>
            ✏️ {editing?'Cancel':'Edit Profile'}
          </button>
        </div>
        <form onSubmit={save}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            {[['name','Full Name'],['phone','Phone'],['street','Street'],['city','City'],['state','State'],['pincode','Pincode']].map(([field,label])=>(
              <div key={field}><label style={{fontSize:12,color:'#878787',display:'block',marginBottom:5}}>{label}</label><input value={f[field]||''} onChange={e=>setF({...f,[field]:e.target.value})} disabled={!editing} style={editing?inpE:inp}/></div>
            ))}
          </div>
          {editing&&<button type="submit" style={{marginTop:20,background:'#388e3c',color:'#fff',padding:'11px 32px',border:'none',borderRadius:4,fontSize:14,fontWeight:700,cursor:'pointer'}}>✓ Save Changes</button>}
        </form>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
        {[{e:'📦',l:'My Orders',s:`${myOrders.length} orders`,to:'/orders',c:'#2874f0'},{e:'💝',l:'Wishlist',s:`${(userInfo?.wishlist||[]).length} items`,to:'/wishlist',c:'#ff6161'},{e:'🎟️',l:'Coupons',s:'4 available',to:'',c:'#388e3c'}].map(item=>(
          <div key={item.l} style={{background:'#fff',borderRadius:4,padding:20,border:'1px solid #f0f0f0',boxShadow:'0 1px 4px rgba(0,0,0,.06)',display:'flex',alignItems:'center',gap:14}}>
            <div style={{width:44,height:44,background:item.c+'15',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{item.e}</div>
            <div>{item.to?<Link to={item.to} style={{fontSize:14,fontWeight:700,color:'#212121',display:'block'}}>{item.l}</Link>:<span style={{fontSize:14,fontWeight:700,color:'#212121'}}>{item.l}</span>}<div style={{fontSize:12,color:'#878787'}}>{item.s}</div></div>
          </div>
        ))}
      </div>
    </div>
  </div>;
}
