import React, { useEffect, useState, useRef } from 'react';
import DataTable from './DataTable';
import { Modal } from '../ui/modals';
import Button from '../ui/buttons';
import { FaTrash } from 'react-icons/fa';

interface ChatRow {
  chat_id: number;
  chat_link: string;
  requester: string;
  helper: string | null;
  generated_on: number;
  chat_status: number;
}

interface ChatTableProps {
  currentUser: {
    id: number;
    username: string;
    email: string;
    profilePicture: string;
    permission: string;
  } | null;
}

const ChatTable: React.FC<ChatTableProps> = ({ currentUser }) => {
  const [selectedChat, setSelectedChat] = useState<ChatRow | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const chatColumns = [
    // { header: 'Chat ID', accessor: 'chat_id' }, // Remove Chat ID from display
    { header: 'Chat Link', accessor: 'chat_link' },
    { header: 'Requester', accessor: 'requester' },
    { header: 'Helper', accessor: 'helper' },
    {
  header: 'Generated On',
  accessor: 'generated_on',
  render: (row: ChatRow) => {
    if (!row.generated_on) return '';
    const date = new Date(row.generated_on); // ISO string handled correctly here
    return isNaN(date.getTime()) ? '' : date.toLocaleString();
  }
},
    { header: 'Status', accessor: 'chat_status', render: (row: ChatRow) => row.chat_status === 1 ? 'Active' : 'Closed' },
  ];

  const chatActions = (row: ChatRow, currentUser: ChatTableProps['currentUser']) => {
    if (currentUser?.permission !== 'Owner') return null;
    return (
      <button
        onClick={() => {
          setSelectedChat(row);
          setIsDeleteModalOpen(true);
        }}
        className="text-red-500 hover:text-red-700"
      >
        <FaTrash />
      </button>
    );
  };

  const confirmDelete = async () => {
    if (!selectedChat) return;
    await fetch('/api/admin/chats', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: selectedChat.chat_id }),
    });
    setIsDeleteModalOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <DataTable
        columns={chatColumns}
        dataUrl="/api/admin/chats"
        actions={chatActions}
        currentUser={currentUser}
        refreshKey={refreshKey}
      />
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <p className="mb-4 text-cyan-500">
          Are you sure you want to delete chat <strong>{selectedChat?.chat_id}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete Chat
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ChatTable;