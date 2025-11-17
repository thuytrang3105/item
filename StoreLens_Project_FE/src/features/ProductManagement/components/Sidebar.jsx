// ProductManagement/components/Sidebar.jsx
import React, { useState, useMemo } from 'react'; 

const calculateStatusCounts = (products) => {
    const counts = { 'all': products.length, 'active': 0, 'inactive': 0, 'low-stock': 0, 'out-of-stock': 0 };
    
    products.forEach(p => {
        let status;
        if (p.stock === 0) status = 'out-of-stock';
        else if (p.stock <= 10) status = 'low-stock';
        else if (p.status === 'active') status = 'active';
        else status = 'inactive';
        
        counts[status] = (counts[status] || 0) + 1;
        counts['all']++;
    });
    return counts;
};

const calculateFilterCounts = (products, keyName) => {
    const filterMap = new Map();
    products.forEach(p => {
        const item = p[keyName]; 
        if (item) {
            filterMap.set(item, (filterMap.get(item) || 0) + 1);
        }
    });
    return Array.from(filterMap, ([label, count]) => ({ label, count }));
};


const Accordion = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const iconClass = `w-4 h-4 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`;
    const contentClass = `transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`;

    return (
        <div className="border border-gray-200 rounded-lg">
            <button
                className="w-full px-4 py-3 text-left flex items-center justify-between bg-white hover:bg-gray-50 rounded-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-sm font-semibold text-gray-700">{title}</span>
                <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div className={contentClass}>
                <div className="pt-3 pb-3 px-4"> 
                    {children}
                </div>
            </div>
        </div>
    );
};

const Sidebar = ({ 
    products, searchTerm, statusFilter, 
    onSearchChange, onStatusChange, onResetFilters,
    selectedCategories, onCategoryChange,
    selectedBrands, onBrandChange,
    maxStockFilter, onMaxStockChange 
}) => {
    const statusCounts = calculateStatusCounts(products);
    
    // Tính toán Danh mục và Thương hiệu động
    const categoryData = useMemo(() => calculateFilterCounts(products, 'category'), [products]);
    const brandData = useMemo(() => calculateFilterCounts(products, 'brand'), [products]);


    return (
        <div className="w-80 min-h-screen border-r border-gray-200" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            <div className="p-6">
                
                {/* Thanh tìm kiếm */}
                <div className="mb-6">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Tìm theo tên, SKU, barcode..." 
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                        <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>

                {/* Lọc trạng thái nhanh */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Trạng thái</h3>
                    <div className="space-y-2">
                        {[
                            { label: 'Tất cả', value: 'all', dot: 'bg-blue-500' },
                            { label: 'Đang bán', value: 'active', dot: 'bg-green-500' },
                            { label: 'Dừng bán', value: 'inactive', dot: 'bg-gray-500' },
                            { label: 'Sắp hết hàng', value: 'low-stock', dot: 'bg-yellow-500' },
                            { label: 'Hết hàng', value: 'out-of-stock', dot: 'bg-red-500' }
                        ].map(({ label, value, dot }) => (
                            <label key={value} className="flex items-center cursor-pointer">
                                <input type="radio" name="status" value={value} className="sr-only" checked={statusFilter === value} onChange={() => onStatusChange(value)} />
                                <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-3 flex items-center justify-center">
                                    <div className={`w-2 h-2 rounded-full ${dot} ${statusFilter === value ? '' : 'hidden'}`}></div>
                                </div>
                                <span className="text-sm text-gray-700">{label}</span>
                                <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{statusCounts[value]}</span>
                            </label>
                        ))}
                    </div>
                </div>
                
                {/* Lọc chi tiết */}
                <div className="space-y-4">
                    
                    {/* ACCORDION DANH MỤC */}
                    <Accordion title="Danh mục" defaultOpen={true}>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {categoryData.map((cat) => (
                                <label key={cat.label} className="flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="checkbox-custom mr-3" 
                                        checked={selectedCategories.has(cat.label)}
                                        onChange={(e) => onCategoryChange(cat.label, e.target.checked)}
                                    />
                                    <span className="text-sm text-gray-700">{cat.label}</span>
                                    <span className="ml-auto text-xs text-gray-500">({cat.count})</span>
                                </label>
                            ))}
                        </div>
                    </Accordion>
                    
                    {/* ACCORDION THƯƠNG HIỆU */}
                    <Accordion title="Thương hiệu" defaultOpen={true}>
                         <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {brandData
                                .sort((a, b) => b.count - a.count)
                                .map((brand) => (
                                <label key={brand.label} className="flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="checkbox-custom mr-3" 
                                        checked={selectedBrands.has(brand.label)} 
                                        onChange={(e) => onBrandChange(brand.label, e.target.checked)} 
                                    />
                                    <span className="text-sm text-gray-700">{brand.label}</span>
                                    <span className="ml-auto text-xs text-gray-500">({brand.count})</span>
                                </label>
                            ))}
                        </div>
                    </Accordion>
                </div>
                
                {/* Lọc tồn kho (ĐÃ KẾT NỐI SLIDER) */}
                <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Tồn kho</h3>
                    <div className="px-2">
                        <input 
                            type="range" 
                            min="0" 
                            max="1000" 
                            value={maxStockFilter} 
                            onChange={(e) => onMaxStockChange(Number(e.target.value))} 
                            className="range-slider w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0</span>
                            <span id="stockValue">{maxStockFilter}</span> 
                            <span>1000+</span>
                        </div>
                    </div>
                </div>
                
                {/* Nút Reset */}
                <div className="mt-6">
                    <button 
                        className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={onResetFilters}
                    > 
                        Xóa tất cả bộ lọc 
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;