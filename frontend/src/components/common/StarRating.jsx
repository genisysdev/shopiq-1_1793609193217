import React from 'react';
const StarRating = ({rating,size=13}) => <span style={{display:'inline-flex',gap:1}}>{[1,2,3,4,5].map(i=><svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i<=Math.round(rating)?'#ff9f00':'#e0e0e0'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}</span>;
export default StarRating;
