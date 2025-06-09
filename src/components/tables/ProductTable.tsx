"use client"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import Image from "next/image";
// components/tables/AdminProductTable.tsx
import React, { useState } from 'react';
import DataTable from './DataTable';
import {Modal} from '../ui/modals';
import Button from '../ui/buttons';
import { FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  const handleView = (product: ProductRow) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleEdit = (product: ProductRow) => {
    setSelectedProduct(product);
    setFormData({ ...product });
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
    setIsAddModalOpen(true);
  };

  const confirmDelete = async () => {
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: selectedProduct.product_id }),
    });
    setIsDeleteModalOpen(false);
    // Refresh data
  };

const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};


  const submitProduct = async () => {
    const url = isAddModalOpen 
      ? '/api/admin/products' 
      : `/api/admin/products?product_id=${selectedProduct.product_id}`;
      
    const method = isAddModalOpen ? 'POST' : 'PUT';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    // Refresh data
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
      <div className="flex justify-end mb-4">
        <Button onClick={handleAdd} className="flex items-center">
          <FaPlus className="mr-2" /> Add Product
        </Button>
      </div>
      
      <DataTable
        columns={productColumns}
        dataUrl="/api/admin/products"
        actions={productActions}
        currentUser={currentUser}
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
        }}
        title={`${isAddModalOpen ? 'Add' : 'Edit'} Product`}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Product Name</label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleFormChange}
              className="text-cyan-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleFormChange}
              className="text-cyan-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
            <input
              type="text"
              name="category_name"
              value={formData.category_name}
              onChange={handleFormChange}
              className="text-cyan-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Button Text</label>
            <input
              type="text"
              name="button_name"
              value={formData.button_name}
              onChange={handleFormChange}
              className="text-cyan-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
            <textarea
              name="product_desc"
              value={formData.product_desc}
              onChange={handleFormChange}
              rows={3}
              className="text-cyan-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">Image URL</label>
            <input
              type="text"
              name="product_image"
              value={formData.product_image}
              onChange={handleFormChange}
              className="text-cyan-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">Link</label>
            <input
              type="text"
              name="link"
              value={formData.link}
              onChange={handleFormChange}
              className="text-cyan-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button 
            variant="secondary" 
            onClick={() => {
              setIsAddModalOpen(false);
              setIsEditModalOpen(false);
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