export const fmt = n => '₹' + Number(n).toLocaleString('en-IN');
export const pct = (orig, curr) => orig > curr ? Math.round(((orig - curr) / orig) * 100) : 0;
export const clamp = (str, n = 60) => str?.length > n ? str.slice(0, n) + '…' : str;
export const statusStyle = s => ({ Delivered:{bg:'#e8f5e9',c:'#2e7d32'}, Shipped:{bg:'#e3f2fd',c:'#1565c0'}, Processing:{bg:'#fff3e0',c:'#e65100'}, Confirmed:{bg:'#ede7f6',c:'#4527a0'}, Pending:{bg:'#fce4ec',c:'#c62828'}, Cancelled:{bg:'#f5f5f5',c:'#616161'}, Paid:{bg:'#e8f5e9',c:'#2e7d32'}, Failed:{bg:'#fce4ec',c:'#c62828'} }[s] || {bg:'#f5f5f5',c:'#555'});
export const CATS = ['All','Electronics','Fashion','Home & Kitchen','Sports','Books','Beauty','Toys'];
