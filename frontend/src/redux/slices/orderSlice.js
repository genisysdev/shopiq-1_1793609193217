import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const placeOrder = createAsyncThunk('orders/place', async (data, { rejectWithValue }) => {
  try { return (await API.post('/orders', data)).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Order failed'); }
});

export const fetchMyOrders = createAsyncThunk('orders/mine', async (_, { rejectWithValue }) => {
  try { return (await API.get('/orders/mine')).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to load orders'); }
});

export const fetchOrderById = createAsyncThunk('orders/one', async (id, { rejectWithValue }) => {
  try { return (await API.get(`/orders/${id}`)).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Order not found'); }
});

export const fetchAllOrders = createAsyncThunk('orders/all', async (params = {}, { rejectWithValue }) => {
  try {
    const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v)));
    return (await API.get(`/admin/orders?${q}`)).data;
  }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to load orders'); }
});

export const updateOrderStatus = createAsyncThunk('orders/status', async ({ id, status, trackingNumber }, { rejectWithValue }) => {
  try { return (await API.put(`/admin/orders/${id}/status`, { status, trackingNumber })).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to update status'); }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: { myOrders: [], allOrders: [], order: null, loading: false, error: null, success: false, pages: 1 },
  reducers: {
    clearOrderState(state) { state.success = false; state.error = null; state.order = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending,   (s) => { s.loading = true; s.error = null; s.success = false; })
      .addCase(placeOrder.fulfilled, (s, a) => { s.loading = false; s.success = true; s.order = a.payload; })
      .addCase(placeOrder.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchMyOrders.fulfilled,  (s, a) => { s.myOrders = a.payload; })
      .addCase(fetchOrderById.fulfilled, (s, a) => { s.order = a.payload; })
      .addCase(fetchAllOrders.fulfilled, (s, a) => { s.allOrders = a.payload.orders || []; s.pages = a.payload.pages || 1; })
      .addCase(updateOrderStatus.fulfilled, (s, a) => {
        const i = s.allOrders.findIndex(o => o._id === a.payload._id);
        if (i > -1) s.allOrders[i] = a.payload;
      });
  },
});

export const { clearOrderState } = orderSlice.actions;
export default orderSlice.reducer;
