import React,{useEffect,useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {useDispatch,useSelector} from 'react-redux';
import {fetchProducts} from '../redux/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import Loader from '../components/common/Loader';
const BANNERS=[
  {bg:'linear-gradient(135deg,#1a237e,#2874f0)',title:'Big Billion Sale',sub:'Up to 80% off on Electronics',cta:'Shop Electronics',cat:'Electronics',accent:'#ffe500'},
  {bg:'linear-gradient(135deg,#880e4f,#e91e63)',title:'Fashion Festival',sub:'Trending styles at best prices',cta:'Shop Fashion',cat:'Fashion',accent:'#fff'},
  {bg:'linear-gradient(135deg,#1b5e20,#43a047)',title:'Home Makeover',sub:'Transform your home for less',cta:'Shop Home',cat:'Home & Kitchen',accent:'#ffe500'},
];
export default function HomePage() {
  const dispatch=useDispatch();const navigate=useNavigate();
  const {items,loading}=useSelector(s=>s.products);
  const [bi,setBi]=useState(0);
  useEffect(()=>{dispatch(fetchProducts({limit:12}));},[dispatch]);
  const banner=BANNERS[bi];
  const featured=items.filter(p=>p.isFeatured).slice(0,4);
  const bestsellers=items.filter(p=>p.badge==='Best Seller').slice(0,4);
  const deals=items.filter(p=>p.badge?.includes('Off')).slice(0,4);
  const W={maxWidth:1200,margin:'0 auto',padding:'0 16px'};
  return <div style={{background:'#f1f3f6',minHeight:'100vh'}}>
    {/* Hero */}
    <div style={{background:banner.bg,padding:'40px 0',marginBottom:16}}>
      <div style={{...W,display:'grid',gridTemplateColumns:'1fr 1fr',gap:32,alignItems:'center'}}>
        <div>
          <span style={{background:'rgba(255,255,255,.15)',color:'#fff',fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:20,letterSpacing:1,textTransform:'uppercase',marginBottom:12,display:'inline-block'}}>Limited Time</span>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:46,fontWeight:900,color:'#fff',margin:'0 0 12px',lineHeight:1.1}}>{banner.title}</h1>
          <p style={{color:'rgba(255,255,255,.85)',fontSize:18,margin:'0 0 28px'}}>{banner.sub}</p>
          <button onClick={()=>navigate(`/products?category=${banner.cat}`)} style={{background:banner.accent,color:banner.accent==='#fff'?'#e91e63':'#2874f0',padding:'13px 32px',border:'none',borderRadius:4,fontSize:15,fontWeight:800,cursor:'pointer'}}>{banner.cta}</button>
        </div>
        <div style={{display:'flex',justifyContent:'center'}}>
          {featured[bi] && <img src={featured[bi]?.images?.[0]?.url} alt="" style={{maxHeight:240,borderRadius:12,boxShadow:'0 20px 60px rgba(0,0,0,.3)'}}/>}
        </div>
      </div>
      <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:20}}>
        {BANNERS.map((_,i)=><button key={i} onClick={()=>setBi(i)} style={{width:i===bi?24:8,height:8,borderRadius:4,background:i===bi?'#fff':'rgba(255,255,255,.4)',border:'none',cursor:'pointer',transition:'all .3s'}}/>)}
      </div>
    </div>
    <div style={W}>
      {/* Category tiles */}
      <div style={{background:'#fff',borderRadius:4,padding:'24px 20px',marginBottom:16,boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:16}}>
          {[{l:'Electronics',e:'📱',c:'#e3f2fd'},{l:'Fashion',e:'👗',c:'#fce4ec'},{l:'Home & Kitchen',e:'🏠',c:'#f3e5f5'},{l:'Sports',e:'⚽',c:'#e8f5e9'},{l:'Books',e:'📚',c:'#fff8e1'}].map(cat=>(
            <button key={cat.l} onClick={()=>navigate(`/products?category=${cat.l}`)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,padding:'16px 8px',background:cat.c,border:'none',borderRadius:8,cursor:'pointer',transition:'transform .2s'}} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
              <span style={{fontSize:34}}>{cat.e}</span>
              <span style={{fontSize:13,fontWeight:700,color:'#212121'}}>{cat.l}</span>
            </button>
          ))}
        </div>
      </div>
      {loading?<Loader text="Loading products…"/>:(<>
        {[{title:'Best Sellers',items:bestsellers,color:'#ff9f00'},{title:'Hot Deals',items:deals,color:'#ff6161'},{title:'Featured Products',items:featured,color:'#2874f0'}].filter(s=>s.items.length>0).map(section=>(
          <div key={section.title} style={{background:'#fff',borderRadius:4,padding:'24px 20px',marginBottom:16,boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:800,margin:0}}>{section.title}</h2>
              <Link to="/products" style={{color:section.color,fontSize:13,fontWeight:700,border:`1.5px solid ${section.color}`,padding:'7px 18px',borderRadius:4}}>View All</Link>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
              {section.items.map(p=><ProductCard key={p._id} product={p}/>)}
            </div>
          </div>
        ))}
      </>)}
      {/* Trust badges */}
      <div style={{background:'#fff',borderRadius:4,padding:'24px 32px',marginBottom:20,boxShadow:'0 1px 4px rgba(0,0,0,.06)',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:24}}>
        {[{e:'🚚',t:'Free Delivery',s:'Orders above ₹499'},{e:'↩️',t:'Easy Returns',s:'10-day hassle-free'},{e:'✅',t:'100% Genuine',s:'Verified products'},{e:'⚡',t:'Fast Delivery',s:'Same day available'}].map(b=>(
          <div key={b.t} style={{display:'flex',alignItems:'center',gap:14}}><span style={{fontSize:28}}>{b.e}</span><div><div style={{fontSize:14,fontWeight:700,color:'#212121'}}>{b.t}</div><div style={{fontSize:12,color:'#878787'}}>{b.s}</div></div></div>
        ))}
      </div>
    </div>
  </div>;
}
