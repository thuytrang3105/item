import axiosInstance from "./axios";
const BASE_URL = "products";

export const getProducts = async (params) => {
    try {
        const url = BASE_URL; 
        const response = await axiosInstance.get(url, {
            params: params // Truyền tất cả tham số lọc (q, status, categories, page, limit)
        });
        
        console.log("Fetched product data:", response.data);
        return response.data;
        
    } catch (error) {
        console.error("Error fetching product list:", error);
        throw error;
    }   
};

export const createProduct = async (productData) => {
    // Gọi đến /products
    const url = BASE_URL; 
    const response = await axiosInstance.post(url, productData);
    return response.data;
};

export const updateProduct = async (id, productData) => {
    // Gọi đến /products/:id
    const url = `${BASE_URL}/${id}`; 
    const response = await axiosInstance.put(url, productData);
    return response.data;
};

export const deleteProduct = async (id) => {
    // Gọi đến /products/:id
    const url = `${BASE_URL}/${id}`;
    const response = await axiosInstance.delete(url);
    return response.data;
};

export const bulkDeleteProducts = async (productIds) => {
    // Gọi đến /products/bulk-delete
    const url = `${BASE_URL}/bulk-delete`; 
    // productIds thường là một mảng ID: { ids: [1, 2, 3] }
    const response = await axiosInstance.post(url, { productIds }); 
    return response.data;
};