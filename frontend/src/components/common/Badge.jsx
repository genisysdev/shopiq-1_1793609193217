import React from 'react';
const COLORS={'Best Seller':'#ff9f00','New Arrival':'#2874f0','New':'#2874f0','Top Rated':'#388e3c','Premium':'#6a1b9a','Out of Stock':'#9e9e9e'};
const Badge = ({text}) => { if(!text) return null; const bg=COLORS[text]||(text.includes('Off')?'#ff6161':'#388e3c'); return <span style={{background:bg,color:'#fff',fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:3,letterSpacing:.5,textTransform:'uppercase'}}>{text}</span>; };
export default Badge;
