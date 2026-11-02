import React,{useState} from 'react';
import {useDispatch} from 'react-redux';
import {toast} from 'react-toastify';
import {createProduct,updateProduct} from '../../redux/slices/productSlice';
import {CATS} from '../../utils/helpers';
const E={name:'',brand:'',category:'Electronics',price:'',originalPrice:'',countInStock:'',description:'',badge:'',sku:'',isFeatured:false,images:[{url:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',alt:''}]};
export default function ProductForm({product,onClose}) {
  const dispatch=useDispatch();
  const [f,setF]=useState(product?{...product}:E);
  const [loading,setLoading]=useState(false);
  const inp={padding:'10px 12px',border:'1px solid #e0e0e0',borderRadius:4,fontSize:14,outline:'none',boxSizing:'border-box',width:'100%'};
  const submit=async e=>{ e.preventDefault(); setLoading(true); const d={...f,price:Number(f.price),originalPrice:Number(f.originalPrice),countInStock:Number(f.countInStock)}; try { if(product) await dispatch(updateProduct({id:product._id,data:d})).unwrap(); else await dispatch(createProduct(d)).unwrap(); toast.success(product?'Product updated!':'Product created!'); onClose(); } catch(e){toast.error(e);} setLoading(false); };
  return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
    <div style={{background:'#fff',borderRadius:8,width:'100%',maxWidth:700,maxHeight:'90vh',overflowY:'auto',padding:32}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:24}}><h2 style={{fontSize:20,fontWeight:800}}>{product?'Edit Product':'Add Product'}</h2><button onClick={onClose} style={{background:'none',border:'none',fontSize:20,cursor:'pointer'}}>✕</button></div>
      <form onSubmit={submit}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
          {[['name','Product Name'],['brand','Brand'],['price','Price (₹)'],['originalPrice','Original Price (₹)'],['countInStock','Stock'],['sku','SKU (optional)'],['badge','Badge (optional)']].map(([field,label])=>(
            <div key={field}><label style={{fontSize:12,color:'#878787',display:'block',marginBottom:5}}>{label}</label><input value={f[field]||''} onChange={e=>setF({...f,[field]:e.target.value})} required={field!=='sku'&&field!=='badge'} style={inp}/></div>
          ))}
          <div><label style={{fontSize:12,color:'#878787',display:'block',marginBottom:5}}>Category</label><select value={f.category} onChange={e=>setF({...f,category:e.target.value})} style={inp}>{CATS.filter(c=>c!=='All').map(c=><option key={c}>{c}</option>)}</select></div>
        </div>
        <div style={{marginBottom:14}}><label style={{fontSize:12,color:'#878787',display:'block',marginBottom:5}}>Image URL</label><input value={f.images?.[0]?.url||''} onChange={e=>setF({...f,images:[{url:e.target.value,alt:f.name}]})} style={inp}/></div>
        <div style={{marginBottom:16}}><label style={{fontSize:12,color:'#878787',display:'block',marginBottom:5}}>Description</label><textarea value={f.description||''} onChange={e=>setF({...f,description:e.target.value})} required rows={3} style={{...inp,resize:'vertical'}}/></div>
        <label style={{display:'flex',alignItems:'center',gap:8,fontSize:14,marginBottom:20,cursor:'pointer'}}><input type="checkbox" checked={f.isFeatured||false} onChange={e=>setF({...f,isFeatured:e.target.checked})} style={{accentColor:'#2874f0',width:16,height:16}}/>Featured product (shows on homepage)</label>
        <div style={{display:'flex',gap:12}}>
          <button type="submit" disabled={loading} style={{background:'#2874f0',color:'#fff',padding:'12px 32px',border:'none',borderRadius:4,fontSize:14,fontWeight:700,cursor:'pointer'}}>{loading?'Saving…':product?'Update':'Create'}</button>
          <button type="button" onClick={onClose} style={{background:'#f0f0f0',color:'#555',padding:'12px 24px',border:'none',borderRadius:4,fontSize:14,cursor:'pointer'}}>Cancel</button>
        </div>
      </form>
    </div>
  </div>;
}
