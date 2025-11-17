import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// Thay đổi đường dẫn import nếu cần
import { getProducts } from '../../services/product.api'; 

// Khởi tạo trạng thái ban đầu cho các bộ lọc
const initialState = {
    products: [],
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    loading: false,
    error: null,

    filters: {
        q: '',
        status: 'all',
        categories: '',
        id: '',
        limit: 20
    }
};

// Async Thunk để gọi API lấy danh sách sản phẩm
export const fetchProducts = createAsyncThunk(    
    'product/fetchProducts',
    async (params, thunkAPI) => {
        try {
            // params sẽ bao gồm {q, status, categories, page, limit}
            const response = await getProducts(params);
            return response; // Trả về {products, totalItems, totalPages, currentPage}
        } catch (error) {
            return thunkAPI.rejectWithValue({ 
                message: 'Failed to fetch products', 
                error: error.message 
            });
        }
    }
);

const productSlice = createSlice({
    name: 'product',
    initialState,

    reducers: {
        // Reducer để cập nhật tham số lọc trước khi gọi API (tùy chọn)
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                console.log('Fetching product list...');
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                console.log('Product list fetched successfully.');
                const payload = action.payload;
                
                state.products = payload.products;
                state.totalItems = payload.totalItems;
                state.totalPages = payload.totalPages;
                state.currentPage = payload.currentPage; // Cập nhật lại trang hiện tại từ BE
                state.loading = false;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                console.error('Failed to fetch products:', action.payload.error);
                state.loading = false;
                state.error = action.payload.message;
            });
    },
}); 

export const { setFilters, setCurrentPage } = productSlice.actions;
export default productSlice.reducer;