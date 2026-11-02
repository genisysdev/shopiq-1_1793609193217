import React,{useEffect,useState} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {toast} from 'react-toastify';
import {fetchProducts,deleteProduct} from '../../redux/slices/productSlice';
import {fmt,pct} from '../../utils/helpers';
import ProductForm from '../../components/admin/ProductForm';
import Loader from '../../components/common/Loader';
export default function AdminProducts() {
  const dispatch=useDispatch();
  const {items,loading,total}=useSelector(s=>s.products);
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  useEffect(()=>{dispatch(fetchProducts({limit:50}));},[dispatch]);
  const handleDelete=async id=>{if(window.confirm('Delete this product?')){try{await dispatch(deleteProduct(id)).unwrap();toast.success('Product deleted');}catch(e){toast.error(e);}}};
  if(loading) return <Loader/>;
  return <div style={{padding:28}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
      <h1 style={{fontSize:24,fontWeight:800,margin:0}}>Products ({total})</h1>
      <button onClick={()=>{setEditing(null);setShowForm(true);}} style={{display:'flex',alignItems:'center',gap:8,background:'#2874f0',color:'#fff',border:'none',padding:'11px 20px',borderRadius:4,fontSize:14,fontWeight:700,cursor:'pointer'}}>+ Add Product</button>
    </div>
    {showForm&&<ProductForm product={editing} onClose={()=>{setShowForm(false);setEditing(null);}}/>}
    <div style={{background:'#fff',borderRadius:8,boxShadow:'0 1px 4px rgba(0,0,0,.08)',overflow:'hidden'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr style={{background:'#f9f9f9'}}>{['Product','Category','Price','Stock','Rating','Actions'].map(h=><th key={h} style={{padding:'14px 16px',textAlign:'left',fontSize:12,fontWeight:700,color:'#878787',textTransform:'uppercase',letterSpacing:.5,borderBottom:'2px solid #f0f0f0'}}>{h}</th>)}</tr></thead>
        <tbody>{items.map(p=><tr key={p._id} style={{borderBottom:'1px solid #f5f5f5'}} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
          <td style={{padding:'14px 16px'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <img src={p.images?.[0]?.url} alt="" style={{width:48,height:48,objectFit:'cover',borderRadius:4,background:'#f5f5f5',flexShrink:0}}/>
              <div><div style={{fontSize:14,fontWeight:600,color:'#212121'}}>{p.name}</div><div style={{fontSize:12,color:'#878787'}}>{p.brand}</div></div>
            </div>
          </td>
          <td style={{padding:'14px 16px',fontSize:13,color:'#555'}}>{p.category}</td>
          <td style={{padding:'14px 16px'}}><div style={{fontSize:14,fontWeight:700}}>{fmt(p.price)}</div>{p.originalPrice>p.price&&<div style={{fontSize:11,color:'#388e3c'}}>{pct(p.originalPrice,p.price)}% off</div>}</td>
          <td style={{padding:'14px 16px'}}><span style={{fontWeight:700,color:p.countInStock===0?'#ff6161':p.countInStock<20?'#ff9f00':'#388e3c',fontSize:14}}>{p.countInStock===0?'Out of Stock':p.countInStock}</span></td>
          <td style={{padding:'14px 16px'}}><span style={{background:'#388e3c',color:'#fff',fontSize:11,fontWeight:700,padding:'2px 6px',borderRadius:3}}>{p.rating?.toFixed(1)} ★</span></td>
          <td style={{padding:'14px 16px'}}>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>{setEditing(p);setShowForm(true);}} style={{display:'flex',alignItems:'center',gap:5,padding:'7px 12px',background:'#e3f2fd',color:'#2874f0',border:'none',borderRadius:4,fontSize:12,fontWeight:700,cursor:'pointer'}}>✏️ Edit</button>
              <button onClick={()=>handleDelete(p._id)} style={{display:'flex',alignItems:'center',gap:5,padding:'7px 12px',background:'#fce4ec',color:'#ff6161',border:'none',borderRadius:4,fontSize:12,fontWeight:700,cursor:'pointer'}}>🗑️ Delete</button>
            </div>
          </td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}
