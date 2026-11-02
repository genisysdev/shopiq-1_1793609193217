import React from 'react';
const Loader = ({ text='' }) => <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:60,gap:14}}><div style={{width:44,height:44,border:'4px solid #e3f2fd',borderTop:'4px solid #2874f0',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>{text&&<p style={{color:'#878787',fontSize:14}}>{text}</p>}</div>;
export default Loader;
