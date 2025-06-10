// components/tables/DataTable.tsx
import React, { useState, useEffect } from 'react';
import Pagination from './Pagination';

interface DataTableProps {
  columns: {
    header: string;
    accessor: string;
    render?: (row: any) => React.ReactNode;
  }[];
  dataUrl: string;
  actions: (row: any, currentUser: any) => React.ReactNode;
  currentUser: any;
  refreshKey?: number;
  onDataChange?: (data: any[]) => void; // Add this prop
}

const DataTable: React.FC<DataTableProps> = ({ 
  columns, 
  dataUrl, 
  actions,
  currentUser,
  refreshKey = 0, // default 0
  onDataChange,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${dataUrl}?page=${currentPage}&limit=${limit}&search=${search}`
      );
      const response = await res.json();
      const dataArray = response.products || response.users || [];
      const totalItems = response.total || 0;
      setData(dataArray);
      setTotalPages(Math.ceil(totalItems / limit));
      if (onDataChange) onDataChange(dataArray); // Notify parent
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };


  
  useEffect(() => {
    fetchData();
  }, [currentPage, limit, search]);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1);
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
  fetchData();
}, [currentPage, limit, search, refreshKey]); // add refreshKey here


  return (
     <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Responsive controls */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={handleSearchChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={limit}
            onChange={handleLimitChange}
            className="w-full sm:w-auto rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-100 dark:border-white/[0.05]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  className="px-5 py-3 text-left font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                >
                  {column.header}
                </th>
              ))}
              <th className="px-5 py-3 text-left font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-5 py-4 text-center text-cyan-500">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-5 py-4 text-center text-cyan-500">
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td
                      key={column.accessor}
                      className="px-5 py-4 text-left text-theme-sm dark:text-gray-400"
                    >
                      {column.render
                        ? column.render(row)
                        : row[column.accessor]}
                    </td>
                  ))}
                  <td className="px-5 py-4 text-left">
                    <div className="flex space-x-2">
                      {actions(row, currentUser)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {data.length} of {totalPages * limit} entries
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default DataTable;