import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';
const stored = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
const save = d => { localStorage.setItem('userInfo', JSON.stringify(d)); return d; };
export const login = createAsyncThunk('auth/login', async (d, { rejectWithValue }) => { try { return save((await API.post('/auth/login',d)).data); } catch(e){ return rejectWithValue(e.response?.data?.message||'Login failed'); } });
export const register = createAsyncThunk('auth/register', async (d, { rejectWithValue }) => { try { return save((await API.post('/auth/register',d)).data); } catch(e){ return rejectWithValue(e.response?.data?.message||'Register failed'); } });
export const updateProfile = createAsyncThunk('auth/update', async (d, { rejectWithValue, getState }) => { try { const r=(await API.put('/auth/me',d)).data; const cur=getState().auth.userInfo; const merged={...cur,...r}; localStorage.setItem('userInfo',JSON.stringify(merged)); return merged; } catch(e){ return rejectWithValue(e.response?.data?.message||'Update failed'); } });
export const toggleWishlist = createAsyncThunk('auth/wishlist', async (pid, { rejectWithValue }) => { try { return (await API.put(`/auth/wishlist/${pid}`)).data.wishlist; } catch(e){ return rejectWithValue(e.response?.data?.message); } });
const s = createSlice({ name:'auth', initialState:{ userInfo:stored, loading:false, error:null },
  reducers:{ logout(s){ s.userInfo=null; localStorage.removeItem('userInfo'); }, clearError(s){ s.error=null; } },
  extraReducers:b=>{ b
    .addCase(login.pending,s=>{s.loading=true;s.error=null})
    .addCase(login.fulfilled,(s,a)=>{s.loading=false;s.userInfo=a.payload})
    .addCase(login.rejected,(s,a)=>{s.loading=false;s.error=a.payload})
    .addCase(register.pending,s=>{s.loading=true;s.error=null})
    .addCase(register.fulfilled,(s,a)=>{s.loading=false;s.userInfo=a.payload})
    .addCase(register.rejected,(s,a)=>{s.loading=false;s.error=a.payload})
    .addCase(updateProfile.fulfilled,(s,a)=>{s.userInfo=a.payload})
    .addCase(toggleWishlist.fulfilled,(s,a)=>{if(s.userInfo)s.userInfo.wishlist=a.payload}); }
});
export const { logout, clearError } = s.actions;
export default s.reducer;
