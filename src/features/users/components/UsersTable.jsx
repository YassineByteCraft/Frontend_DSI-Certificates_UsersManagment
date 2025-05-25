// src/features/users/components/UsersTable.jsx
import React from 'react';
import { IconButton } from '@material-tailwind/react';
import { formatDateToDMY } from '../../../common/utils/dateUtils';

// Utility: SortIcon (remains the same)
const SortIcon = ({ direction }) => (
  <svg
    className={`inline-block ml-1 h-3 w-3 transition-transform duration-150 ${direction === 1 ? 'rotate-180' : ''}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
);

// Utility: LoadingSpinner (remains the same)
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-4">
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span>Loading...</span>
  </div>
);

// Main Component
export default function UserTable({
  users = [], // Default to empty array to prevent .map error
  onEdit,
  onDelete,
  onRevokeTokens,
  onSort,
  sortField,
  sortOrder,
  isLoading,
  infiniteScrollRef,
  hasMore
}) {
  // Define widths for your columns.
  const baseColumns = [
    { field: 'username', header: 'Username', sortable: true, wrapText: false, width: '12%' },
    { field: 'email', header: 'Email', sortable: true, wrapText: true, width: '18%' },
    { field: 'firstname', header: 'First Name', sortable: true, wrapText: true, width: '12%' },
    { field: 'lastname', header: 'Last Name', sortable: true, wrapText: true, width: '12%' },
    { field: 'idNumber', header: 'ID Number', sortable: true, wrapText: false, width: '11%' },
    { field: 'role', header: 'Role', sortable: true, wrapText: false, width: '10%' },
    { field: 'status', header: 'Status', sortable: true, wrapText: false, width: '10%' },
    { field: 'createdAt', header: 'Created At', sortable: true, wrapText: false, width: '10%' },
  ];
  const columns = [
    ...baseColumns,
    { field: 'actions', header: 'Actions', sortable: false, wrapText: false, width: '5%' },
  ];

  const handleHeaderClick = (column) => {
    if (column.sortable && onSort && !isLoading) {
      const newSortOrder = sortField === column.field ? (sortOrder === 1 ? -1 : 1) : 1;
      onSort(column.field, newSortOrder);
    }
  };

  return (
    <div className="relative shadow-md sm:rounded-lg h-full overflow-auto scrollbar-hide border border-[#64748B]" >
      <table className="text-sm text-left text-gray-500 table-fixed ">
        <colgroup>
          {columns.map(col => (
            <col key={`col-${col.field}`} style={{ width: col.width }} />
          ))}
        </colgroup>
        <thead className="text-xs text-gray-700 uppercase thead-bottom-shadow bg-[#64748B] sticky top-0 z-10">
          <tr>
            {columns.map((column) => (
              <th
                key={column.field}
                scope="col"
                onClick={() => handleHeaderClick(column)}
                // Removed border classes from th
                 className={`px-2 py-2 whitespace-nowrap
                   ${column.sortable
                     ? 'cursor-pointer select-none hover:bg-gray-200 hover:text-[#64748B] active:bg-gray-300 '
                     : ''
                   }
                   ${sortField === column.field
                     ? 'bg-gray-200 text-[#64748B]'
                     : 'text-white' // Ensured header text is white by default
                   }`}
              >
                {column.header}
                {column.sortable && sortField === column.field && <SortIcon direction={sortOrder} />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading && users.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="">
                <LoadingSpinner />
              </td>
            </tr>
          )}
          {!isLoading && users.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500 ">
                No users found.
              </td>
            </tr>
          )}
          {users.map((user, rowIndex) => (
            <tr
                key={user.id ?? `user-${rowIndex}`}
                className={
                  `transition-colors duration-150 ease-in-out text-[#3c4451] border-b border-[#acbcd470] ` +
                  (rowIndex % 2 === 1 ? 'bg-blue-50' : 'bg-white')
                }
            >
              {baseColumns.map((column, colIndex) => (
                <td
                  key={`${column.field}-${rowIndex}-${colIndex}`}
                  className={`px-2 py-2 ${!column.wrapText ? 'whitespace-nowrap' : 'break-words'}`}
                >
                  {column.field === 'status' ? (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                      ${user.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                      : user.status === 'SUSPENDED' 
                        ? 'bg-yellow-100 text-yellow-800' 
                      : user.status === 'DELETED' 
                        ? 'bg-red-100 text-red-800' : ''}`}>{user.status}</span>
                  ) : column.field === 'createdAt' ? (
                    user.createdAt ? formatDateToDMY(new Date(user.createdAt)) : '--'
                  ) : (
                    user[column.field] ?? '--'
                  )}
                </td>
              ))}
              <td className="px-2 py-2 whitespace-nowrap">
                <div className="flex gap-2 justify-center">
                  <IconButton
                    variant="text"
                    color="blue-gray"
                    size="sm"
                    onClick={() => onEdit(user)}
                    disabled={isLoading}
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </IconButton>
                  {user.status !== 'DELETED' && (
                    <IconButton
                      variant="text"
                      color="red"
                      size="sm"
                      onClick={() => onDelete(user)}
                      disabled={isLoading}
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </IconButton>
                  )}
                  <IconButton
                    variant="text"
                    color="purple"
                    size="sm"
                    onClick={() => onRevokeTokens(user.id)}
                    disabled={isLoading}
                    title="Revoke Tokens"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.707 9.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10l-2.293-2.293a1 1 0 011.414-1.414L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293z" />
                    </svg>
                  </IconButton>
                </div>
              </td>
            </tr>
          ))}
          {users.length > 0 && hasMore && (
            <tr ref={infiniteScrollRef} className="">
              <td colSpan={columns.length} className="">
                {isLoading && <LoadingSpinner />}
              </td>
            </tr>
          )}
          {users.length > 0 && !hasMore && !isLoading && (
            <tr>
              <td colSpan={columns.length} className="p-4 text-center text-gray-400 text-sm ">
                All users loaded.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}