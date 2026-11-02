import React,{useState,useEffect} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {useDispatch,useSelector} from 'react-redux';
import {toast} from 'react-toastify';
import {register,clearError} from '../redux/slices/authSlice';
export default function RegisterPage() {
  const dispatch=useDispatch();const navigate=useNavigate();
  const {userInfo,loading,error}=useSelector(s=>s.auth);
  const [f,setF]=useState({name:'',email:'',password:'',confirm:''});
  useEffect(()=>{if(userInfo)navigate('/');if(error){toast.error(error);dispatch(clearError());}},[userInfo,error,navigate,dispatch]);
  const submit=e=>{e.preventDefault();if(f.password!==f.confirm)return toast.error('Passwords do not match');dispatch(register({name:f.name,email:f.email,password:f.password})).then(r=>{if(register.fulfilled.match(r))toast.success('Account created!');});};
  const inp={width:'100%',padding:'12px 16px',border:'1px solid #e0e0e0',borderRadius:4,fontSize:14,outline:'none',boxSizing:'border-box',marginBottom:14};
  return <div style={{minHeight:'100vh',background:'#f1f3f6',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
    <div style={{background:'#fff',borderRadius:8,padding:'48px 40px',maxWidth:480,width:'100%',boxShadow:'0 4px 24px rgba(0,0,0,.1)'}}>
      <div style={{textAlign:'center',marginBottom:32}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:900}}>shop<span style={{color:'#2874f0'}}>IQ</span></div><p style={{color:'#878787',marginTop:6}}>Create your account</p></div>
      <form onSubmit={submit}>
        {[['name','Full Name','text','Priya Sharma'],['email','Email','email','priya@example.com'],['password','Password','password','Min 6 characters'],['confirm','Confirm Password','password','Repeat password']].map(([field,label,type,ph])=>(
          <div key={field}><label style={{fontSize:12,color:'#878787',display:'block',marginBottom:5}}>{label}</label><input type={type} value={f[field]} onChange={e=>setF({...f,[field]:e.target.value})} placeholder={ph} required style={inp}/></div>
        ))}
        <button type="submit" disabled={loading} style={{width:'100%',padding:'13px 0',background:'#2874f0',color:'#fff',border:'none',borderRadius:4,fontSize:15,fontWeight:800,cursor:'pointer',marginBottom:16}}>
          {loading?'Creating…':'CREATE ACCOUNT'}
        </button>
      </form>
      <p style={{textAlign:'center',fontSize:13,color:'#555'}}>Already have an account? <Link to="/login" style={{color:'#2874f0',fontWeight:700}}>Login</Link></p>
    </div>
  </div>;
}
