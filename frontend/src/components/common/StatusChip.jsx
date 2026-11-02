import React from 'react';
import { statusStyle } from '../../utils/helpers';
const StatusChip = ({status}) => { const {bg,c}=statusStyle(status); return <span style={{background:bg,color:c,fontSize:12,fontWeight:700,padding:'3px 10px',borderRadius:12,whiteSpace:'nowrap'}}>{status}</span>; };
export default StatusChip;
