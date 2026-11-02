import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

const setCart = (state, action) => {
  state.loading = false;
  state.error = null;
  const c = action.payload || {};
  state.items = c.items || [];
  state.couponCode = c.couponCode || null;
  state.discountAmount = c.discountAmount || 0;
};

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try { return (await API.get('/cart')).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to fetch cart'); }
});

export const addToCart = createAsyncThunk('cart/add', async (data, { rejectWithValue }) => {
  try { return (await API.post('/cart', data)).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to add to cart'); }
});

export const updateQty = createAsyncThunk('cart/qty', async ({ productId, quantity }, { rejectWithValue }) => {
  try { return (await API.put(`/cart/${productId}`, { quantity })).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to update'); }
});

export const removeItem = createAsyncThunk('cart/remove', async (productId, { rejectWithValue }) => {
  try { return (await API.delete(`/cart/${productId}`)).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to remove'); }
});

export const clearCartAPI = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try { await API.delete('/cart'); return null; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to clear'); }
});

export const applyCoupon = createAsyncThunk('cart/coupon', async (data, { rejectWithValue }) => {
  try { return (await API.post('/coupons/apply', data)).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Invalid coupon'); }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], coupon: null, couponCode: null, discountAmount: 0, loading: false, error: null },
  reducers: {
    setCoupon(state, action) { state.coupon = action.payload; state.discountAmount = action.payload.discountAmount; },
    removeCoupon(state) { state.coupon = null; state.discountAmount = 0; state.couponCode = null; },
    clearCartLocal(state) { state.items = []; state.coupon = null; state.discountAmount = 0; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending,  (s) => { s.loading = true; s.error = null; })
      .addCase(fetchCart.fulfilled,  setCart)
      .addCase(fetchCart.rejected,   (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(addToCart.fulfilled,  setCart)
      .addCase(addToCart.rejected,   (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(updateQty.fulfilled,  setCart)
      .addCase(removeItem.fulfilled, setCart)
      .addCase(clearCartAPI.fulfilled, (s) => { s.items = []; s.coupon = null; s.discountAmount = 0; })
      .addCase(applyCoupon.fulfilled, (s, a) => {
        s.coupon = a.payload;
        s.discountAmount = a.payload.discountAmount;
        s.couponCode = a.payload.code;
      });
  },
});

export const { setCoupon, removeCoupon, clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;
