
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@material-tailwind/react';
import { useUsers } from '../hooks/useUsers';
import UsersPanel from './UsersPanel';
import UserTable from './UsersTable';
import DeleteUserDialog from './DeleteUserDialog';
import { Toast } from 'primereact/toast';

export default function UsersPage() {
  const toast = useRef(null);

  const {
    users,
    isLoading,
    error: apiError,
    fetchAllUsers,
    addUser,
    editUser,
    removeUser,
    adminRevokeTokens,
  } = useUsers();

  const [formMode, setFormMode] = useState('hidden');
  const [editingUser, setEditingUser] = useState(null);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState(-1); // 1 for asc, -1 for desc
  const [filterParams, setFilterParams] = useState({});
  const [globalSearch, setGlobalSearch] = useState("");
  const [clearGlobalSearch, setClearGlobalSearch] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const globalSearchTimeout = useRef();
  const globalSearchInputRef = useRef();

  const fieldSpecificErrors = apiError?.fields || {};

  useEffect(() => {
    fetchAllUsers({ ...filterParams, page: 0, sort: `${sortField},${sortOrder === 1 ? 'asc' : 'desc'}` });
  }, [fetchAllUsers, sortField, sortOrder, filterParams]); 
  
  const hidePanelAndClearErrors = () => {
    if (isLoading) return;
    setEditingUser(null);
    setFormMode('hidden');
  };

  const toggleMode = mode => {
    const next = formMode === mode ? 'hidden' : mode;
    if (next !== 'update' && mode !== 'update') {
      setEditingUser(null);
    }
    setFormMode(next);
  };

  const handleEditUserSetup = (u) => {
    setEditingUser(u);
    setFormMode('update');
  };

  const handleCreateUser = async (data) => {
    const result = await addUser(data);

    if (result.success) {
      hidePanelAndClearErrors();
      toast.current.show({ severity: 'success', summary: 'Success', detail: result.message || 'User created successfully!', life: 3500 });
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: result.message || apiError?.general || 'Failed to create user', // Prioritize message from result
        life: 3500
      });
    }
  };

  const handleUpdateUser = async (id, data) => {
    const result = await editUser(id, data);

    if (result.success) {
      hidePanelAndClearErrors();
      toast.current.show({ severity: 'success', summary: 'Success', detail: result.message || 'User updated successfully!', life: 3500 });
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: result.message || apiError?.general || 'Failed to update user',
        life: 3500
      });
    }
  };

  const handleRequestDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (userToDelete) {
      await handleDeleteUser(userToDelete.id, userToDelete.idNumber);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = async (userId, userIdNumber) => {
    const result = await removeUser(userId, userIdNumber);
    if (result.success) {
      toast.current.show({ severity: 'success', summary: 'Success', detail: result.message || 'User deleted successfully!', life: 3500 });
    } else {
      toast.current.show({ severity: 'error', summary: 'Error', detail: result.message || apiError?.general || 'Failed to delete user', life: 3500 });
    }
  };

  const handleSort = (field, order) => {
    if (isLoading) return;
    setSortField(field);
    setSortOrder(order);
  };

  useEffect(() => {
    if (globalSearchTimeout.current) clearTimeout(globalSearchTimeout.current);
    globalSearchTimeout.current = setTimeout(() => {
      setFilterParams(prev => ({ ...prev, globalSearch }));
    }, 600);
    return () => {
      if (globalSearchTimeout.current) clearTimeout(globalSearchTimeout.current);
    };
  }, [globalSearch]);

  useEffect(() => {
    if (globalSearchInputRef.current && document.activeElement !== globalSearchInputRef.current) {
      globalSearchInputRef.current.focus();
      const val = globalSearchInputRef.current.value;
      globalSearchInputRef.current.value = '';
      globalSearchInputRef.current.value = val;
    }
  }, [isLoading, globalSearch]);

  useEffect(() => {
    if (clearGlobalSearch) {
      setGlobalSearch("");
      setClearGlobalSearch(false);
    }
  }, [clearGlobalSearch]);


  return (
    <div className="w-full h-screen max-w-10xl mx-auto flex flex-col px-2 gap-2">
      <Toast ref={toast} position="bottom-center" className="custom-toast-border" />
      <div className="flex justify-between items-center pb-1 pt-2 flex-wrap gap-2">
        <div className="flex gap-2">
          <Button
            variant="outlined"
            color="blue-gray"
            onClick={() => toggleMode('filter')}
            disabled={isLoading}
            className={`flex items-center gap-1 ${formMode === 'filter' ? 'bg-[#64748b] text-white' : 'bg-[#b6c5d92e] text-[#364965]'}`}
          >
            Filters
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`h-4 w-4 transition-transform ${formMode === 'filter' ? "rotate-180" : ""}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </Button>
          <Button
            variant="outlined"
            color="blue-gray"
            onClick={() => toggleMode('create')}
            disabled={isLoading}
            className={`flex items-center gap-1 ${formMode === 'create' ? 'bg-[#64748b] text-white' : 'bg-[#b6c5d92e] text-[#364965]'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add New User
          </Button>
        </div>
        <div className="flex flex-1 justify-end">
          <div className="relative w-64">
            <input
              ref={globalSearchInputRef}
              type="text"
              className="border border-blue-gray-500 rounded-md py-2 pl-10 pr-10 w-full focus:outline-none focus:border-blue-500 text-sm"
              placeholder="Global search..."
              value={globalSearch}
              onChange={e => {
                setGlobalSearch(e.target.value);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (globalSearchTimeout.current) clearTimeout(globalSearchTimeout.current);
                  setFilterParams(prev => ({ ...prev, globalSearch }));
                }
              }}
              disabled={isLoading}
            />
            <span className="absolute left-3 top-2.5 text-[#364965]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </span>
            {globalSearch && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setGlobalSearch("")}
                tabIndex={-1}
                aria-label="Clear global search"
                disabled={isLoading}
              >
                &#10005;
              </button>
            )}
          </div>
        </div>
      </div>

      <UsersPanel
        formMode={formMode}
        editingUser={editingUser}
        onFilter={criteria => {
          setFilterParams(criteria);
        }}
        onCreate={handleCreateUser}
        onUpdate={handleUpdateUser}
        onCancel={hidePanelAndClearErrors}
        fieldErrors={fieldSpecificErrors}
        onResetFilters={() => {
          setGlobalSearch("");
          setClearGlobalSearch(true);
        }}
      />

      {apiError?.general && Object.keys(fieldSpecificErrors).length === 0 && (
        <div className="text-red-500 p-2 my-2 bg-red-100 border border-red-400 rounded text-sm">
          {apiError.general}
        </div>
      )}

      <div className="flex-grow overflow-auto bg-white rounded-lg shadow-md min-h-[300px]">
        <UserTable
          users={users}
          isLoading={isLoading}
          onEdit={handleEditUserSetup}
          onDelete={handleRequestDeleteUser}
          onRevokeTokens={adminRevokeTokens}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder} 
          infinite scroll
        />
      </div>
      <DeleteUserDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDeleteUser}
      />
      <div className="w-full bg-white pb-1 bg-[#eaf3ffd6]" />
    </div>
  );
}