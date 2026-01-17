import React, { useState, useEffect } from "react";
import {
    Search,
    X,
    Plus,
    Trash,
    Eye,
    Package,
} from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { db } from "../firebase.js";
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    Timestamp,
} from "firebase/firestore";

const Products = () => {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const q = query(
                collection(db, "products"),
                orderBy("createdAt", "desc")
            );
            
            const snapshot = await getDocs(q);
            
            const productsData = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    productTitle: data.productTitle || 'Untitled Product',
                    descriptions: data.descriptions || 'No description',
                    brand: data.brand || 'N/A',
                    categories: data.categories || 'N/A',
                    subcategories: data.subcategories || 'N/A',
                    color: data.color || 'N/A',
                    material: data.material || 'N/A',
                    fit: data.fit || 'N/A',
                    originalPrice: data.originalPrice || 0,
                    stockQuantity: data.stockQuantity || 0,
                    stockStatus: data.stockStatus || 'out_of_stock',
                    productCondition: data.productCondition || 'N/A',
                    status: data.status || 'draft',
                    photos: data.photos || [],
                    allowOffers: data.allowOffers || false,
                    boost: data.boost || false,
                    isSponsored: data.isSponsored || false,
                    rating: data.rating || 0,
                    ratingCount: data.ratingCount || 0,
                    sellerName: data.sellerName || 'N/A',
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
                };
            });
            
            setProducts(productsData);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const [newProduct, setNewProduct] = useState({
        productTitle: "",
        descriptions: "",
        brand: "",
        categories: "",
        subcategories: "",
        color: "",
        material: "",
        fit: "",
        originalPrice: "",
        stockQuantity: "",
        stockStatus: "in_stock",
        productCondition: "Like New",
        status: "publish",
        allowOffers: false,
        boost: false,
        isSponsored: false,
        photos: [],
        file: null,
    });

    const convertImageToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleCreate = async () => {
        if (!newProduct.productTitle || !newProduct.originalPrice || !newProduct.file) {
            alert("Please fill all required fields including image!");
            return;
        }

        try {
            const base64Image = await convertImageToBase64(newProduct.file);
            
            const productData = {
                productTitle: newProduct.productTitle,
                descriptions: newProduct.descriptions,
                brand: newProduct.brand,
                categories: newProduct.categories,
                subcategories: newProduct.subcategories,
                color: newProduct.color,
                material: newProduct.material,
                fit: newProduct.fit,
                originalPrice: parseFloat(newProduct.originalPrice) || 0,
                stockQuantity: parseInt(newProduct.stockQuantity) || 0,
                stockStatus: newProduct.stockStatus,
                productCondition: newProduct.productCondition,
                status: newProduct.status,
                allowOffers: newProduct.allowOffers,
                boost: newProduct.boost,
                isSponsored: newProduct.isSponsored,
                photos: [base64Image],
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                rating: 0,
                ratingCount: 0,
                searchCount: 0,
                viewCount: 0,
                trendingScore: 0,
            };

            await addDoc(collection(db, "products"), productData);
            
            fetchProducts();
            setShowCreate(false);
            setNewProduct({
                productTitle: "",
                descriptions: "",
                brand: "",
                categories: "",
                subcategories: "",
                color: "",
                material: "",
                fit: "",
                originalPrice: "",
                stockQuantity: "",
                stockStatus: "in_stock",
                productCondition: "Like New",
                status: "publish",
                allowOffers: false,
                boost: false,
                isSponsored: false,
                photos: [],
                file: null,
            });
            alert("Product created successfully!");
        } catch (error) {
            console.error('Failed to create product:', error);
            alert('Failed to create product: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteDoc(doc(db, "products", id));
                setProducts(products.filter((p) => p.id !== id));
                alert("Product deleted successfully!");
            } catch (error) {
                console.error('Failed to delete product:', error);
                alert('Failed to delete product: ' + error.message);
            }
        }
    };

    const filteredProducts = products.filter((p) =>
        p.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categories.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            
            {/* Overlay for mobile when sidebar is open */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden" 
                    onClick={toggleSidebar}
                />
            )}
            
            {/* Main content area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-60' : 'ml-0'}`}>
                <TopBar toggleSidebar={toggleSidebar} />
                
                <main className="flex-1 p-6 overflow-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-[#0A1E3A]">
                        Products Management
                    </h2>

                    {/*<button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 bg-[#0A1E3A] text-white px-3 sm:px-5 py-2 rounded-lg hover:bg-[#112d58] text-sm transition-colors"
                    >
                        <Plus size={18} />
                        Create Product
                    </button>*/}
                </div>
                <div className="relative w-full max-w-md mb-6">
                    <Search
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search Products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    />
                </div>
                {loading ? (
                    <div className="text-center py-8">Loading products...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <div
                                className="bg-white rounded-xl border shadow-sm hover:shadow-md transition"
                                key={product.id}
                            >
                                <img
                                    src={product.photos && product.photos.length > 0 ? product.photos[0] : 'https://via.placeholder.com/300x200?text=No+Image'}
                                    alt={product.productTitle}
                                    className="w-full h-40 object-cover rounded-t-xl"
                                />

                                <div className="p-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-[#0A1E3A] text-lg">
                                            {product.productTitle}
                                        </h3>

                                        <span
                                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                product.status === "publish"
                                                    ? "bg-green-100 text-green-600"
                                                    : product.status === "draft"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-600"
                                            }`}
                                        >
                                            {product.status}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.descriptions}</p>

                                    <div className="mt-3 text-sm space-y-1">
                                        <p>
                                            <strong>Brand:</strong> {product.brand}
                                        </p>
                                        <p>
                                            <strong>Category:</strong> {product.categories}
                                        </p>
                                        <p>
                                            <strong>Price:</strong> د.إ{product.originalPrice?.toLocaleString() || '0'}
                                        </p>
                                        <p>
                                            <strong>Stock:</strong> {product.stockQuantity} ({product.stockStatus === 'in_stock' ? 'In Stock' : 'Out of Stock'})
                                        </p>
                                        {product.rating > 0 && (
                                            <p>
                                                <strong>Rating:</strong> {product.rating} ({product.ratingCount} reviews)
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-4 flex justify-between gap-2">
                                        <button
                                            onClick={() => setSelectedProduct(product)}
                                            className="flex-1 border border-[#0A1E3A] text-[#0A1E3A] py-1 rounded-lg text-xs sm:text-sm hover:bg-[#0A1E3A] hover:text-white transition"
                                        >
                                            <Eye size={14} className="inline-block mr-1" />
                                            View
                                        </button>

                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="flex-1 border border-red-500 text-red-600 py-1 rounded-lg text-xs sm:text-sm hover:bg-red-600 hover:text-white transition"
                                        >
                                            <Trash size={14} className="inline-block mr-1" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {filteredProducts.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-500">
                        No products found
                    </div>
                )}
                {selectedProduct && (
                    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
                        <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-lg relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-4 right-4 text-gray-600 hover:text-black"
                            >
                                <X size={22} />
                            </button>

                            <h2 className="text-xl font-semibold mb-4">
                                {selectedProduct.productTitle}
                            </h2>

                            {selectedProduct.photos && selectedProduct.photos.length > 0 && (
                                <img
                                    src={selectedProduct.photos[0]}
                                    className="w-full h-52 object-cover rounded-lg mb-4"
                                    alt={selectedProduct.productTitle}
                                />
                            )}

                            <div className="space-y-2 text-sm">
                                <p><strong>Status:</strong> {selectedProduct.status}</p>
                                <p><strong>Description:</strong> {selectedProduct.descriptions}</p>
                                <p><strong>Brand:</strong> {selectedProduct.brand}</p>
                                <p><strong>Category:</strong> {selectedProduct.categories}</p>
                                <p><strong>Subcategory:</strong> {selectedProduct.subcategories}</p>
                                <p><strong>Color:</strong> {selectedProduct.color}</p>
                                <p><strong>Material:</strong> {selectedProduct.material}</p>
                                <p><strong>Fit:</strong> {selectedProduct.fit}</p>
                                <p><strong>Price:</strong> د.إ{selectedProduct.originalPrice?.toLocaleString() || '0'}</p>
                                <p><strong>Stock Quantity:</strong> {selectedProduct.stockQuantity}</p>
                                <p><strong>Stock Status:</strong> {selectedProduct.stockStatus === 'in_stock' ? 'In Stock' : 'Out of Stock'}</p>
                                <p><strong>Condition:</strong> {selectedProduct.productCondition}</p>
                                <p><strong>Seller:</strong> {selectedProduct.sellerName}</p>
                                {selectedProduct.rating > 0 && (
                                    <>
                                        <p><strong>Rating:</strong> {selectedProduct.rating} / 5</p>
                                        <p><strong>Rating Count:</strong> {selectedProduct.ratingCount}</p>
                                    </>
                                )}
                                <p><strong>Allow Offers:</strong> {selectedProduct.allowOffers ? 'Yes' : 'No'}</p>
                                <p><strong>Boost:</strong> {selectedProduct.boost ? 'Yes' : 'No'}</p>
                                <p><strong>Sponsored:</strong> {selectedProduct.isSponsored ? 'Yes' : 'No'}</p>
                                <p><strong>Created:</strong> {formatDate(selectedProduct.createdAt)}</p>
                                <p><strong>Updated:</strong> {formatDate(selectedProduct.updatedAt)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {showCreate && (
                    <div className="fixed inset-0 bg-black/40 flex justify-center items-center py-20 px-6 z-50">
                        <div className="bg-white rounded-xl w-full max-w-2xl px-4 py-2 relative shadow-lg max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="absolute top-4 right-4 text-gray-600 hover:text-black"
                            >
                                <X size={22} />
                            </button>

                            <h2 className="text-xl font-semibold mb-3">Create New Product</h2>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <label className="text-sm font-medium whitespace-nowrap w-32">Product Title:</label>
                                    <input
                                        type="text"
                                        placeholder="Product Title"
                                        className="flex-1 border px-3 py-2 rounded-lg"
                                        value={newProduct.productTitle}
                                        onChange={(e) =>
                                            setNewProduct({ ...newProduct, productTitle: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="flex items-start gap-3">
                                    <label className="text-sm font-medium whitespace-nowrap w-32 pt-2">Description:</label>
                                    <textarea
                                        placeholder="Product Description"
                                        className="flex-1 border px-3 py-2 rounded-lg"
                                        value={newProduct.descriptions}
                                        onChange={(e) =>
                                            setNewProduct({ ...newProduct, descriptions: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Brand</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Baby clothes"
                                            className="w-full border px-3 py-2 rounded-lg"
                                            value={newProduct.brand}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, brand: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Category</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Baby Luxe"
                                            className="w-full border px-3 py-2 rounded-lg"
                                            value={newProduct.categories}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, categories: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Subcategory</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Baby Clothing"
                                            className="w-full border px-3 py-2 rounded-lg"
                                            value={newProduct.subcategories}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, subcategories: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Color</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., purple"
                                            className="w-full border px-3 py-2 rounded-lg"
                                            value={newProduct.color}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, color: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Material</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., cotton"
                                            className="w-full border px-3 py-2 rounded-lg"
                                            value={newProduct.material}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, material: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Fit</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., small size"
                                            className="w-full border px-3 py-2 rounded-lg"
                                            value={newProduct.fit}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, fit: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Original Price</label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 16"
                                            className="w-full border px-3 py-2 rounded-lg"
                                            value={newProduct.originalPrice}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, originalPrice: e.target.value })
                                            }
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 10"
                                            className="w-full border px-3 py-2 rounded-lg"
                                            value={newProduct.stockQuantity}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, stockQuantity: e.target.value })
                                            }
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Stock Status</label>
                                        <select
                                            value={newProduct.stockStatus}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, stockStatus: e.target.value })
                                            }
                                            className="w-full border px-3 py-2 rounded-lg"
                                        >
                                            <option value="in_stock">In Stock</option>
                                            <option value="out_of_stock">Out of Stock</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Product Condition</label>
                                        <select
                                            value={newProduct.productCondition}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, productCondition: e.target.value })
                                            }
                                            className="w-full border px-3 py-2 rounded-lg"
                                        >
                                            <option value="Like New">Like New</option>
                                            <option value="Excellent">Excellent</option>
                                            <option value="Good">Good</option>
                                            <option value="Fair">Fair</option>
                                            <option value="Poor">Poor</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select
                                        value={newProduct.status}
                                        onChange={(e) =>
                                            setNewProduct({ ...newProduct, status: e.target.value })
                                        }
                                        className="w-full border px-3 py-2 rounded-lg"
                                    >
                                        <option value="publish">Publish</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={newProduct.allowOffers}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, allowOffers: e.target.checked })
                                            }
                                            className="w-4 h-4"
                                        />
                                        <label className="text-sm font-medium">Allow Offers</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={newProduct.boost}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, boost: e.target.checked })
                                            }
                                            className="w-4 h-4"
                                        />
                                        <label className="text-sm font-medium">Boost</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={newProduct.isSponsored}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, isSponsored: e.target.checked })
                                            }
                                            className="w-4 h-4"
                                        />
                                        <label className="text-sm font-medium">Sponsored</label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Upload Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setNewProduct({ ...newProduct, file });
                                            }
                                        }}
                                        className="w-full border px-3 py-2 rounded-lg"
                                    />
                                </div>
                                <button
                                    onClick={handleCreate}
                                    className="w-full bg-[#0A1E3A] text-white py-2 rounded-lg hover:bg-[#112d58] text-sm transition-colors"
                                >
                                    Create Product
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                </main>
            </div>
        </div>
    );
};

export default Products;

