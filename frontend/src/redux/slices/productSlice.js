import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';
export const fetchProducts = createAsyncThunk('products/fetch', async (p={}, {rejectWithValue}) => { try { const q=new URLSearchParams(Object.fromEntries(Object.entries(p).filter(([,v])=>v!==''&&v!=null))); return (await API.get(`/products?${q}`)).data; } catch(e){ return rejectWithValue(e.response?.data?.message); } });
export const fetchBySlug   = createAsyncThunk('products/slug',  async (slug,{rejectWithValue}) => { try { return (await API.get(`/products/${slug}`)).data; } catch(e){ return rejectWithValue(e.response?.data?.message); } });
export const createProduct = createAsyncThunk('products/create',async (d,{rejectWithValue}) => { try { return (await API.post('/products',d)).data; } catch(e){ return rejectWithValue(e.response?.data?.message); } });
export const updateProduct = createAsyncThunk('products/update',async ({id,data},{rejectWithValue}) => { try { return (await API.put(`/products/${id}`,data)).data; } catch(e){ return rejectWithValue(e.response?.data?.message); } });
export const deleteProduct = createAsyncThunk('products/delete',async (id,{rejectWithValue}) => { try { await API.delete(`/products/${id}`); return id; } catch(e){ return rejectWithValue(e.response?.data?.message); } });
export const addReview     = createAsyncThunk('products/review',async ({id,data},{rejectWithValue}) => { try { return (await API.post(`/products/${id}/reviews`,data)).data; } catch(e){ return rejectWithValue(e.response?.data?.message); } });
const s = createSlice({ name:'products', initialState:{ items:[], product:null, page:1, pages:1, total:0, loading:false, error:null },
  reducers:{ clearProduct(s){s.product=null;} },
  extraReducers:b=>{ b
    .addCase(fetchProducts.pending,s=>{s.loading=true;s.error=null})
    .addCase(fetchProducts.fulfilled,(s,a)=>{s.loading=false;s.items=a.payload.products;s.page=a.payload.page;s.pages=a.payload.pages;s.total=a.payload.total})
    .addCase(fetchProducts.rejected,(s,a)=>{s.loading=false;s.error=a.payload})
    .addCase(fetchBySlug.pending,s=>{s.loading=true;s.product=null})
    .addCase(fetchBySlug.fulfilled,(s,a)=>{s.loading=false;s.product=a.payload})
    .addCase(fetchBySlug.rejected,(s,a)=>{s.loading=false;s.error=a.payload})
    .addCase(createProduct.fulfilled,(s,a)=>{s.items.unshift(a.payload);s.total++})
    .addCase(updateProduct.fulfilled,(s,a)=>{const i=s.items.findIndex(p=>p._id===a.payload._id);if(i>-1)s.items[i]=a.payload})
    .addCase(deleteProduct.fulfilled,(s,a)=>{s.items=s.items.filter(p=>p._id!==a.payload);s.total--}); }
});
export const { clearProduct } = s.actions;
export default s.reducer;
