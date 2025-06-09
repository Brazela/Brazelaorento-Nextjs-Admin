// components/tables/AdminUserTable.tsx
"use client"
import React, { useEffect, useState } from 'react';
import DataTable from './DataTable';
import {Modal}  from '../ui/modals';
import  Button from '../ui/button';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
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

interface UserRow {
  id: number;
  username: string;
  email: string;
  profilePicture: string;
  permission: string;
  verificationCode?: string;
  resetPassCode?: string;
}

const AdminUserTable: React.FC<UserDropdownProps> = ({ currentUser }) => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [permission, setPermission] = useState('Guest');

  useEffect(() => {
    console.log("Current User Permission:", currentUser?.permission);
  }, [currentUser]);

 const handleView = (user: UserRow)  => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEdit = (user: UserRow) => {
    setSelectedUser(user);
    setPermission(user.permission);
    setIsEditModalOpen(true);
  };

  const handleDelete = (user: UserRow) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedUser.id }),
    });
    setIsDeleteModalOpen(false);
    // Refresh data
  };

  const updatePermission = async () => {
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedUser.id, permission }),
    });
    setIsEditModalOpen(false);
    // Refresh data
  };

  const userColumns = [
    { header: 'Username', accessor: 'username' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Profile',
      accessor: 'profilePicture',
    render: (row: UserRow) => (

        <img 
          src={row.profilePicture || '/images/photo/default.png'} 
          alt={row.username} 
          className="w-10 h-10 rounded-full object-cover"
        />
      ),
    },
    { header: 'Permission', accessor: 'permission' },
  ];

const userActions = (row: UserRow, currentUser: UserDropdownProps['currentUser']) => (
    <>
      <button 
        onClick={() => handleView(row)}
        className="text-blue-500 hover:text-blue-700"
      >
        <FaEye />
      </button>
      
    {currentUser?.permission === 'Owner' && (
        <>
          <button 
            onClick={() => handleEdit(row)}
            className="text-yellow-500 hover:text-yellow-700"
          >
            <FaEdit />
          </button>
          <button 
            onClick={() => handleDelete(row)}
            className="text-red-500 hover:text-red-700"
          >
            <FaTrash />
          </button>
        </>
      )}
    </>
  );

  return (
    <div>
      <DataTable
        columns={userColumns}
        dataUrl="/api/admin/users"
        actions={userActions}
        currentUser={currentUser}
      />

      {/* View User Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <img 
                src={selectedUser.profilePicture || '/images/photo/default.png'} 
                alt={selectedUser.username} 
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="text-lg font-bold text-cyan-500">{selectedUser.username}</h3>
                <p className="text-gray-500">{selectedUser.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Permission</label>
                <p className="mt-1 text-cyan-500">{selectedUser.permission}</p>
              </div>
              
            {currentUser?.permission === 'Owner' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Verification Code</label>
                    <p className="mt-1 text-cyan-500">{selectedUser.verificationCode || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Reset Password Code</label>
                    <p className="mt-1 text-cyan-500">{selectedUser.resetPassCode || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Permission Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User Permission"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permission Level
              </label>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="Guest">Guest</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updatePermission}>
                Update Permission
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <p className="mb-4 text-cyan-500">
          Are you sure you want to delete user <strong>{selectedUser?.username}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete User
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUserTable;