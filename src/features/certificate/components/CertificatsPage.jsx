import React, { useState, useEffect, useRef } from "react";
import { Button } from '@material-tailwind/react';
import { Toast } from 'primereact/toast';

import { useCertificats } from '../hooks/useCertificats';
import CertificatsPanel from './CertificatsPanel';
import CertificatsTable from './CertificatsTable';

export default function CertificatsPage() {
  const {
    certificates,
    isLoading,
    error,
    fetchAllCertificates,
    addCertificate,
    editCertificate,
    removeCertificate,
  } = useCertificats();

  const [formMode, setFormMode] = useState('hidden');
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [sortField, setSortField] = useState('expirationDate');
  const [sortOrder, setSortOrder] = useState(1);
  const [filterParams, setFilterParams] = useState({});
  const [globalSearch, setGlobalSearch] = useState("");
  const [clearGlobalSearch, setClearGlobalSearch] = useState(false);
  const globalSearchTimeout = useRef();
  const globalSearchInputRef = useRef();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [lastFetchedPage, setLastFetchedPage] = useState(0);
  const fetchingRef = useRef(false);
  const toast = useRef(null);

  // Fetch certificates on mount or when sort/filter changes
  useEffect(() => {
    setPage(0);
    setLastFetchedPage(0);
    setHasMore(true);

    fetchAllCertificates(
      { ...filterParams, page: 0, sort: `${sortField},${sortOrder === 1 ? 'asc' : 'desc'}` },
      false
    ).then(pageData => {
      if (pageData?.isLastPage || pageData?.content?.length === 0 || pageData?.error) {
        setHasMore(false);
      }
    });
  }, [fetchAllCertificates, sortField, sortOrder, filterParams]);

  // Fetch next page when page state changes
  useEffect(() => {
    let isMounted = true;

    if (page > 0 && hasMore && !isLoading && page !== lastFetchedPage) {
      fetchAllCertificates(
        { ...filterParams, page, sort: `${sortField},${sortOrder === 1 ? 'asc' : 'desc'}` },
        true
      ).then(pageData => {
        if (isMounted) {
          setLastFetchedPage(page);
          if (pageData?.isLastPage || pageData?.content?.length === 0 || pageData?.error) {
            setHasMore(false);
          }
        }
      }).catch(err => {
        if (isMounted) {
          console.error(`Error loading page ${page}:`, err);
          setHasMore(false);
        }
      });
    }

    return () => { isMounted = false; };
  }, [page, hasMore, isLoading, sortField, sortOrder, filterParams, fetchAllCertificates, lastFetchedPage]);

  const toggleMode = mode => {
    const next = formMode === mode ? 'hidden' : mode;
    if (next !== 'update') setEditingCertificate(null);
    setFormMode(next);
  };

  const hidePanel = () => {
    if (isLoading) return;
    setEditingCertificate(null);
    setFormMode('hidden');
  };

  const handleSort = (field, order) => {
    if (!isLoading) {
      setSortField(field);
      setSortOrder(order);
    }
  };

  const handleFilter = (criteria) => {
    setFilterParams(criteria);
    setPage(0);
    setLastFetchedPage(0);
    setHasMore(true);
    fetchAllCertificates(
      { ...criteria, page: 0, sort: `${sortField},${sortOrder === 1 ? 'asc' : 'desc'}` },
      false
    ).then(pageData => {
      if (pageData?.isLastPage || pageData?.content?.length === 0 || pageData?.error) {
        setHasMore(false);
      }
    });
  };

  const handleCreate = async (data) => {
    try {
      const result = await addCertificate(data);
      if (result && result.success === false) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: result.message || 'Failed to create certificate',
          life: 5000,
        });
        return;
      }
      hidePanel();
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Certificate created successfully!',
        life: 3000,
      });
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: err?.message || 'Failed to create certificate',
        life: 5000,
      });
    }
  };

  const handleUpdate = async (updatedData) => {
    try {
      await editCertificate(editingCertificate.id, updatedData);
      hidePanel();
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Certificate updated successfully!',
        life: 3000,
      });
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: err?.message || 'Failed to update certificate',
        life: 5000,
      });
    }
  };

  const handleDeleteCertificate = async (certificateId) => {
    try {
      const result = await removeCertificate(certificateId);
      if (result && result.success === false) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: result.message || 'Failed to delete certificate',
          life: 5000,
        });
        return;
      }
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Certificate deleted successfully!',
        life: 3000,
      });
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: err?.message || 'Failed to delete certificate',
        life: 5000,
      });
    }
  };

  // Debounce global search filterParams update to avoid input focus loss
  useEffect(() => {
    if (globalSearchTimeout.current) clearTimeout(globalSearchTimeout.current);
    globalSearchTimeout.current = setTimeout(() => {
      setFilterParams(prev => ({ ...prev, globalSearch }));
    }, 600);
    return () => {
      if (globalSearchTimeout.current) clearTimeout(globalSearchTimeout.current);
    };
  }, [globalSearch]);

  // Ensure input keeps focus after fetch
  useEffect(() => {
    if (globalSearchInputRef.current && document.activeElement !== globalSearchInputRef.current) {
      globalSearchInputRef.current.focus();
      // Optionally move cursor to end
      const val = globalSearchInputRef.current.value;
      globalSearchInputRef.current.value = '';
      globalSearchInputRef.current.value = val;
    }
  }, [isLoading, globalSearch]);

  // Listen for clearGlobalSearch and reset it after clearing
  useEffect(() => {
    if (clearGlobalSearch) {
      setGlobalSearch("");
      setClearGlobalSearch(false);
    }
  }, [clearGlobalSearch]);

  return (
    <div className="w-full overflow-auto h-screen max-w-10xl mx-auto flex flex-col px-2 gap-2">
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
            Add New Certificate
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

      <CertificatsPanel
        formMode={formMode}
        editingCertificate={editingCertificate}
        onFilter={handleFilter}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onCancel={hidePanel}
        onResetFilters={() => {
          setGlobalSearch("");
          setClearGlobalSearch(true);
        }}
      />

      <div className="flex-grow w-full overflow-auto bg-white rounded-lg shadow-md min-h-[300px]">
        <CertificatsTable
          certificates={certificates}
          isLoading={isLoading}
          onEdit={(cert) => {
            setEditingCertificate(cert);
            setFormMode('update');
          }}
          onDelete={handleDeleteCertificate}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
          hasMore={hasMore}
          onLoadMore={() => {
            if (!isLoading && hasMore) setPage(prev => prev + 1);
          }}
        />
      </div>

      <div className="w-full bg-white pb-1" />
    </div>
  );
}