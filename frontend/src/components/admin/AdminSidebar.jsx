import React from 'react';
import { NavLink } from 'react-router-dom';
const links=[{to:'/admin',l:'Dashboard',e:'📊',end:true},{to:'/admin/products',l:'Products',e:'📦'},{to:'/admin/orders',l:'Orders',e:'🚚'},{to:'/admin/users',l:'Users',e:'👥'}];
export default function AdminSidebar() {
  return <aside style={{width:220,background:'#1a1a2e',minHeight:'100vh',padding:'24px 0',flexShrink:0}}>
    <div style={{padding:'0 20px 24px',borderBottom:'1px solid #2d2d4e',marginBottom:8}}>
      <div style={{fontSize:22,fontWeight:900}}><span style={{fontFamily:"'Playfair Display',serif",color:'#fff'}}>shop</span><span style={{fontFamily:"'Playfair Display',serif",color:'#ffe500'}}>IQ</span></div>
      <div style={{fontSize:11,color:'#666',marginTop:2}}>Admin Panel</div>
    </div>
    {links.map(l=><NavLink key={l.to} to={l.to} end={l.end} style={({isActive})=>({display:'flex',alignItems:'center',gap:12,padding:'13px 20px',background:isActive?'#2874f0':'none',color:isActive?'#fff':'#9999bb',textDecoration:'none',fontSize:14,fontWeight:isActive?700:400})}>
      <span>{l.e}</span>{l.l}
    </NavLink>)}
  </aside>;
}
