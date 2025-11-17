// ProductManagement/ProductManagement.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'; 
import { fetchProducts, setFilters, setCurrentPage } from '../../redux/product/product';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Table from './components/Table';
import AddProductModal from './components/AddProductModal';

// Hàm xác định trạng thái sản phẩm (Dùng cho logic lọc nội bộ và Sidebar count)
const getStockStatus = (product) => {
    if (product.stock === 0) return 'out-of-stock';
    if (product.stock <= 10) return 'low-stock';
    if (product.status === 'active') return 'active';
    return 'inactive';
};

const ProductManagement = () => {
    const dispatch = useDispatch();
    
    // LẤY DỮ LIỆU VÀ TRẠNG THÁI TỪ REDUX STORE
    const { products, totalItems, totalPages, loading, filters } = useSelector(state => state.product);

    // TRẠNG THÁI LỌC & PHÂN TRANG TỪ REDUX
    const { q: searchTerm, status: statusFilter, categories: categoriesString, limit: itemsPerPage } = filters;
    const currentPage = useSelector(state => state.product.currentPage); 
    
    // TRẠNG THÁI UI VÀ LỌC NỘI BỘ TẠM THỜI
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dropdownOpenId, setDropdownOpenId] = useState(null);
    const [selectedProductIds, setSelectedProductIds] = useState(new Set());
    const [maxStockFilter, setMaxStockFilter] = useState(1000); 
    const [selectedBrands, setSelectedBrands] = useState(new Set()); 
    const selectedCategories = useMemo(() => new Set(categoriesString.split(',').filter(c => c)), [categoriesString]);


    // LOGIC GỌI API CHÍNH
    useEffect(() => {
        const params = { q: searchTerm, status: statusFilter, categories: categoriesString, page: currentPage, limit: itemsPerPage };
        dispatch(fetchProducts(params));
    }, [dispatch, searchTerm, statusFilter, categoriesString, currentPage, itemsPerPage]); 


    // LOGIC LỌC NỘI BỘ (BRAND VÀ TỒN KHO)
    const filteredProducts = useMemo(() => {
        
        return products.filter(product => {
            // LỌC TỒN KHO NỘI BỘ
            if (product.stock > maxStockFilter) return false;
            
            // LỌC BRAND NỘI BỘ
            const brandsArray = Array.from(selectedBrands);
            if (brandsArray.length > 0) {
                if (!brandsArray.includes(product.brand)) return false;
            }
            return true;
        });
    }, [products, maxStockFilter, selectedBrands]); 


    // HANDLERS (Đã chuyển sang dùng Redux Dispatch)
    const handleSearchChange = (q) => { dispatch(setFilters({ q, page: 1 })); };
    const handleStatusChange = (status) => { dispatch(setFilters({ status, page: 1 })); };
    const handleCategoryChange = (category, isChecked) => {
        const newCategories = new Set(selectedCategories);
        isChecked ? newCategories.add(category) : newCategories.delete(category);
        dispatch(setFilters({ categories: Array.from(newCategories).join(','), page: 1 }));
    };
    const handlePageChange = (page) => { dispatch(setCurrentPage(page)); };
    const handleItemsPerPageChange = (e) => { dispatch(setFilters({ limit: Number(e.target.value), page: 1 })); };

    
    // --- LOGIC THAO TÁC HÀNG LOẠT ---
    const handleMaxStockChange = (value) => { setMaxStockFilter(value); setCurrentPage(1); };

    const handleBulkDelete = () => {
        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa ${selectedProductIds.size} sản phẩm đã chọn?`);
        if (confirmDelete) {
            alert(`Đã xóa thành công ${selectedProductIds.size} sản phẩm.`);
            setSelectedProductIds(new Set()); 
        }
    };
    
    const handleBulkEdit = () => {
        alert(`Mở modal chỉnh sửa cho ${selectedProductIds.size} sản phẩm...`);
    };

    const paginatedProducts = filteredProducts; 
    const selectedOnCurrentPage = paginatedProducts.filter(p => selectedProductIds.has(p.id)).length;
    const isAllSelected = selectedOnCurrentPage > 0 && selectedOnCurrentPage === paginatedProducts.length;
    const isIndeterminate = selectedOnCurrentPage > 0 && !isAllSelected;
    
    const handleSelectProduct = (id, isChecked) => {
        setSelectedProductIds(prev => {
            const newSet = new Set(prev);
            isChecked ? newSet.add(id) : newSet.delete(id);
            return newSet;
        });
    };

    const handleSelectAll = (isChecked) => {
        if (isChecked) {
            const allIds = new Set(paginatedProducts.map(p => p.id));
            setSelectedProductIds(prev => new Set([...prev, ...allIds])); 
        } else {
            setSelectedProductIds(prev => {
                const newSet = new Set(prev);
                paginatedProducts.forEach(p => newSet.delete(p.id));
                return newSet;
            });
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header onAddProduct={() => setIsModalOpen(true)} />
            
            <div className="flex">
                <Sidebar 
                    products={products} 
                    searchTerm={searchTerm}
                    statusFilter={statusFilter}
                    onSearchChange={handleSearchChange}
                    onStatusChange={handleStatusChange}
                    selectedCategories={selectedCategories}
                    onCategoryChange={handleCategoryChange} 
                    
                    selectedBrands={selectedBrands}
                    onBrandChange={(brand, isChecked) => {
                        const newBrands = new Set(selectedBrands);
                        isChecked ? newBrands.add(brand) : newBrands.delete(brand);
                        setSelectedBrands(newBrands);
                    }}
                    maxStockFilter={maxStockFilter}
                    onMaxStockChange={handleMaxStockChange}
                    
                    onResetFilters={() => { 
                        dispatch(setFilters({ q: '', status: 'all', categories: '', limit: 20 }));
                        setMaxStockFilter(1000); 
                        setSelectedBrands(new Set()); 
                        dispatch(setCurrentPage(1));
                    }}
                />
                
                <Table 
                    products={filteredProducts} 
                    totalItems={totalItems}
                    
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    
                    selectedProductIds={selectedProductIds}
                    isAllSelected={isAllSelected}
                    isIndeterminate={isIndeterminate}
                    onSelectProduct={handleSelectProduct}
                    onSelectAll={handleSelectAll}
                    onBulkDelete={handleBulkDelete}
                    onBulkEdit={handleBulkEdit}
                    toggleDropdown={setDropdownOpenId}
                    dropdownOpenId={dropdownOpenId}
                />
            </div>
            <AddProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={() => { alert('Sản phẩm đã được thêm thành công!'); setIsModalOpen(false); }} />
        </div>
    );
};

export default ProductManagement;