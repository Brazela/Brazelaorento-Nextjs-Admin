"use client"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { FaImage } from 'react-icons/fa';

import Badge from "../ui/badge/Badge";
import Image from "next/image";
// components/tables/AdminProductTable.tsx
import React, { useRef, useState, useEffect } from 'react';
import DataTable from './DataTable';
import {Modal} from '../ui/modals';
import Button from '../ui/buttons';
import { FaEye, FaEdit, FaTrash, FaPlus, FaDownload } from 'react-icons/fa';
import { exportUsersToPDF, exportUsersToExcel } from '../utils/exportUtils';

interface UserDropdownProps {
  currentUser: {
   id: number;
  username: string;
  email: string;
  profilePicture: string;
  permission: string;
  verificationCode?: string;
  resetPassCode?: string;
  } | null;
}


// Add this interface
interface ProductRow {
  product_id: number;
  product_name: string;
  product_desc: string;
  product_image: string;
  price: number;
  category_name: string;
  link: string;
  button_name: string;
  uploaded_date: string;
}


const AdminProductTable: React.FC<UserDropdownProps> = ({ currentUser }) => {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [productImage, setProductImage] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    // Add state for validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    product_desc: '',
    product_image: '',
    price: 0,
    category_name: '',
    link: '',
    button_name: '',
  });

  const [productsData, setProductsData] = useState<ProductRow[]>([]); // For export
  const [downloadOpen, setDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);
  const [visibleProducts, setVisibleProducts] = useState<ProductRow[]>([]); // For export (current page/filter)

  const handleView = (product: ProductRow) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

   const handleEdit = (product: ProductRow) => {
    setSelectedProduct(product);
    setFormData({ ...product });
    // Show existing image in preview
    setImagePreview(product.product_image);
    setIsEditModalOpen(true);
  };


  const handleDelete = (product: ProductRow) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      product_name: '',
      product_desc: '',
      product_image: '',
      price: 0,
      category_name: '',
      link: '',
      button_name: '',
    });
    // Reset image states
    setProductImage(null);
    setImagePreview(null);
    setIsAddModalOpen(true);
    // Clear errors
    setFormErrors({});
  };
  
  const confirmDelete = async () => {
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: selectedProduct.product_id }),
    });
    setIsDeleteModalOpen(false);
    // Refresh data
     setRefreshKey((prev) => prev + 1); // trigger table refresh
  };

const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};


  // Validate form function
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.product_name) errors.product_name = 'Product name is required';
    if (!formData.product_desc) errors.product_desc = 'Description is required';
    // if (formData.price <= 0) errors.price = 'Price must be greater than 0';
    if (!formData.category_name) errors.category_name = 'Category is required';
    if (!formData.link) errors.link = 'Link is required';
    if (!formData.button_name) errors.button_name = 'Button text is required';
    
    // For new products, require an image
    if (isAddModalOpen && !productImage) {
      errors.product_image = 'Image is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitProduct = async () => {
    // Validate form first
    if (!validateForm()) {
      return;
    }
    
    const formDataToSend = new FormData();
    

   // Append all fields EXCEPT product_image
formDataToSend.append('product_name', formData.product_name);
formDataToSend.append('product_desc', formData.product_desc);
formDataToSend.append('price', String(formData.price));
formDataToSend.append('category_name', formData.category_name);
formDataToSend.append('link', formData.link);
formDataToSend.append('button_name', formData.button_name);

// Handle image separately
if (productImage) {
  formDataToSend.append('product_image', productImage);
} else if (formData.product_image) {
  formDataToSend.append('product_image', formData.product_image);
}

    // For edit, append product_id
    if (!isAddModalOpen && selectedProduct) {
      formDataToSend.append('product_id', String(selectedProduct.product_id));
    }

    try {
      const url = '/api/admin/products';
      const method = isAddModalOpen ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit product');
      }

      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error submitting product:', error);
      // Show error to user
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
// Add file input handler

 const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  
  if (!file) return;
  
  // Validate file type and size
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    setFormErrors(prev => ({
      ...prev,
      product_image: 'Unsupported file type. Only JPG, PNG, GIF, and WEBP are allowed.'
    }));
    return;
  }
  
  if (file.size > MAX_FILE_SIZE) {
    setFormErrors(prev => ({
      ...prev,
      product_image: 'File size exceeds 2MB limit'
    }));
    return;
  }
  
  setProductImage(file);
  setFormErrors(prev => ({ ...prev, product_image: '' }));
  
  // Create preview
  const reader = new FileReader();
  reader.onload = () => {
    setImagePreview(reader.result as string);
  };
  reader.readAsDataURL(file);
};


  const productColumns = [
    { header: 'Product Name', accessor: 'product_name' },
    {
      header: 'Image',
      accessor: 'product_image',
      render: (row: ProductRow) => (
        <img 
          src={row.product_image} 
          alt={row.product_name} 
          className="w-16 h-16 object-cover rounded"
        />
      ),
    },
    { 
      header: 'Price', 
      accessor: 'price',
      render: (row: ProductRow) => `$${row.price.toFixed(2)}`,
    },
    { header: 'Category', accessor: 'category_name' },
    { header: 'Uploaded Date', accessor: 'uploaded_date' },
  ];
const productActions = (row: ProductRow, currentUser: UserDropdownProps['currentUser']) => (
    <>
      <button 
        onClick={() => handleView(row)}
        className="text-blue-500 hover:text-blue-700"
      >
        <FaEye />
      </button>
      
      <button 
        onClick={() => handleEdit(row)}
        className="text-yellow-500 hover:text-yellow-700"
      >
        <FaEdit />
      </button>
      
   {currentUser?.permission === 'Owner' && (
        <button 
          onClick={() => handleDelete(row)}
          className="text-red-500 hover:text-red-700"
        >
          <FaTrash />
        </button>
      )}
    </>
  );


  
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div></div>
        <div className="relative w-full sm:w-auto flex justify-start" ref={downloadRef}>
          <button
            className="flex items-center w-full sm:w-auto px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 focus:outline-none justify-center"
            onClick={() => setDownloadOpen((v) => !v)}
          >
            <FaDownload className="mr-2" /> Download
          </button>
          {downloadOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-12 w-full sm:w-48 bg-white border rounded shadow-lg z-20 min-w-[180px]">
              <button
                className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  exportUsersToPDF(visibleProducts, 'product');
                  setDownloadOpen(false);
                }}
              >
                <FaDownload className="text-cyan-600" />
                <span>Download as PDF</span>
              </button>
              <button
                className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  exportUsersToExcel(visibleProducts, 'product');
                  setDownloadOpen(false);
                }}
              >
                <FaDownload className="text-green-600" />
                <span>Download as Excel</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <DataTable
        columns={productColumns}
        dataUrl="/api/admin/products"
        actions={productActions}
        currentUser={currentUser}
        refreshKey={refreshKey}
        onDataChange={setVisibleProducts}
      />

      {/* View Product Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Product Details"
        size="xl"
      >
        {selectedProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img 
                src={selectedProduct.product_image} 
                alt={selectedProduct.product_name} 
                className="w-full object-cover rounded-lg"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2 text-cyan-500">{selectedProduct.product_name}</h2>
           <p
  className="text-cyan-500 mb-4"
  dangerouslySetInnerHTML={{
    __html: selectedProduct.product_desc.replace(/<br\s*\/?>/gi, "<br/>"),
  }}
/>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Price</label>
                  <p className="font-semibold text-cyan-500">${selectedProduct.price.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Category</label>
                  <p className="font-semibold text-cyan-500">{selectedProduct.category_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Upload Date</label>
                  <p className="font-semibold text-cyan-500">{selectedProduct.uploaded_date}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">Link</label>
                <a 
                  href={selectedProduct.link} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-cyan-500"
                >
                  {selectedProduct.link}
                </a>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Button Text</label>
                <p className="font-semibold text-cyan-500">{selectedProduct.button_name}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Product Modal */}
     <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setFormErrors({});
        }}
        title={`${isAddModalOpen ? 'Add' : 'Edit'} Product`}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Product Name *</label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleFormChange}
              className={`text-cyan-500 w-full rounded-lg border ${formErrors.product_name ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none`}
            />
            {formErrors.product_name && <p className="text-red-500 text-xs mt-1">{formErrors.product_name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Price *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleFormChange}
              className={`text-cyan-500 w-full rounded-lg border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none`}
            />
            {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Category *</label>
            <input
              type="text"
              name="category_name"
              value={formData.category_name}
              onChange={handleFormChange}
              className={`text-cyan-500 w-full rounded-lg border ${formErrors.category_name ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none`}
            />
            {formErrors.category_name && <p className="text-red-500 text-xs mt-1">{formErrors.category_name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Button Text *</label>
            <input
              type="text"
              name="button_name"
              value={formData.button_name}
              onChange={handleFormChange}
              className={`text-cyan-500 w-full rounded-lg border ${formErrors.button_name ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none`}
            />
            {formErrors.button_name && <p className="text-red-500 text-xs mt-1">{formErrors.button_name}</p>}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">Description *</label>
            <textarea
              name="product_desc"
              value={formData.product_desc}
              onChange={handleFormChange}
              rows={3}
              className={`text-cyan-500 w-full rounded-lg border ${formErrors.product_desc ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none`}
            />
            {formErrors.product_desc && <p className="text-red-500 text-xs mt-1">{formErrors.product_desc}</p>}
          </div>
          

        <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-500 mb-1">
      Product Image {isAddModalOpen && '*'}
    </label>
    
    <div className="flex flex-col items-center">
      {/* Preview or current image */}
      {imagePreview ? (
        <img 
          src={imagePreview} 
          alt="Preview" 
          className="w-32 h-32 object-contain border rounded mb-2"
        />
      ) : !isAddModalOpen && formData.product_image ? (
        <div className="mb-2">
          <p className="text-sm text-gray-500 mb-1">Current Image:</p>
          <img 
            src={formData.product_image} 
            alt="Current" 
            className="w-32 h-32 object-contain border rounded"
          />
        </div>
      ) : (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed border-gray-500 mb-2 flex items-center justify-center">
          <FaImage className="text-2xl text-gray-500" />
        </div>
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg transition-colors"
      >
        Choose Image
      </button>
    </div>

    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      className="hidden"
    />
    {formErrors.product_image && <p className="text-red-500 text-xs mt-1">{formErrors.product_image}</p>}
    
    <p className="text-xs text-gray-400 mt-2">
      Supported formats: JPG, PNG, GIF, WEBP. Max size: 2MB.
    </p>
  </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">Link *</label>
            <input
              type="text"
              name="link"
              value={formData.link}
              onChange={handleFormChange}
              className={`text-cyan-500 w-full rounded-lg border ${formErrors.link ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none`}
            />
            {formErrors.link && <p className="text-red-500 text-xs mt-1">{formErrors.link}</p>}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button 
            variant="secondary" 
            onClick={() => {
              setIsAddModalOpen(false);
              setIsEditModalOpen(false);
              setFormErrors({});
            }}
          >
            Cancel
          </Button>
          <Button onClick={submitProduct}>
            {isAddModalOpen ? 'Add Product' : 'Update Product'}
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <p className="mb-4 text-cyan-500">
          Are you sure you want to delete product <strong>{selectedProduct?.product_name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete Product
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProductTable;