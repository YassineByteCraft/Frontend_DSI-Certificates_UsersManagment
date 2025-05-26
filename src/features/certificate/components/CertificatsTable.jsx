import React from "react";
import { IconButton, Button } from "@material-tailwind/react";
import { formatDateToDMY } from "../../../common/utils/dateUtils";

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

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-4">
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span>Loading...</span>
  </div>
);

const getCertificateStatus = (expirationDateString) => {
  if (!expirationDateString || expirationDateString === '--') {
    return 'normal';
  }
  const expirationDateValue = new Date(expirationDateString);
  if (isNaN(expirationDateValue.getTime())) {
    console.warn(`Invalid date string received: ${expirationDateString}`);
    return 'normal';
  }
  const expDate = new Date(expirationDateValue.getFullYear(), expirationDateValue.getMonth(), expirationDateValue.getDate());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (expDate < today) {
    return 'expired';
  }
  const thirtyDaysFromToday = new Date(today);
  thirtyDaysFromToday.setDate(today.getDate() + 30);
  if (expDate < thirtyDaysFromToday) {
    return 'expiring_soon';
  }
  return 'normal';
};

// Main Component
export default function CertificateTable({
  certificates,
  onSort,
  sortField,
  sortOrder,
  onEdit,
  onDelete,
  infiniteScrollRef,
  hasMore,
  isLoading,
  onLoadMore
}) {
  const baseColumns = [
    { field: "idDemand", header: "ID Demand", sortable: true, wrapText: false, width: "10%" },
    { field: "demandeName", header: "Demande Name", sortable: true, wrapText: true, width: "15%" },
    { field: "model", header: "Model", sortable: true, wrapText: true, width: "15%" },
    { field: "type", header: "Type", sortable: true, wrapText: false, width: "10%" },
    { field: "organizationalUnit", header: "Org Unit", sortable: true, wrapText: true, width: "15%" },
    { field: "commonName", header: "Common Name", sortable: true, wrapText: true, width: "15%" },
    { field: "creationDate", header: "Created", sortable: true, wrapText: false, width: "10%" },
    { field: "expirationDate", header: "Expires", sortable: true, wrapText: false, width: "10%" },
  ];

  const columns = [
    ...baseColumns,
    { field: "actions", header: "Editing", sortable: false, wrapText: false, width: "5%" }, // e.g., 5% or a fixed pixel value like '70px'
  ];

  const handleHeaderClick = (column) => {
    if (column.sortable && onSort && !isLoading) {
      const newSortOrder =
        sortField === column.field ? (sortOrder === 1 ? -1 : 1) : 1;
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
                className={`px-2 py-2 whitespace-nowrap
                  ${column.sortable 
                    ? 'cursor-pointer select-none hover:bg-gray-200 hover:text-[#64748B] active:bg-gray-300 ' 
                    : ''
                  } 
                  ${sortField === column.field 
                    ? 'bg-gray-200 text-[#64748B]' 
                    : 'text-white'
                  }`
                }
              >
                {column.header}
                {column.sortable && sortField === column.field && <SortIcon direction={sortOrder} />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading && certificates.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="">
                <LoadingSpinner />
              </td>
            </tr>
          )}

          {!isLoading && certificates.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500 ">
                No certificates found.
              </td>
            </tr>
          )}

          {certificates.map((certificate, rowIndex) => { 
            const status = getCertificateStatus(certificate.expirationDate);
            let rowClasses = "transition-colors duration-150 ease-in-out";

            switch (status) {
              case 'expired':
                rowClasses += " bg-red-100 text-red-800 hover:bg-red-200";
                break;
              case 'expiring_soon':
                rowClasses += " bg-orange-100 text-orange-800 hover:bg-orange-200";
                break;
              default:
                rowClasses += " bg-white hover:bg-blue-50 text-gray-700";
                break;
            }

            // Generate a unique key for each row by always appending rowIndex
            let certKey = undefined;
            if (certificate.id && certificate.idDemand) {
              certKey = `${certificate.id}-${certificate.idDemand}-${rowIndex}`;
            } else if (certificate.id) {
              certKey = `id-${certificate.id}-${rowIndex}`;
            } else if (certificate.idDemand) {
              certKey = `demand-${certificate.idDemand}-${rowIndex}`;
            } else {
              certKey = `cert-${rowIndex}`;
            }

            return (
              <tr
                key={certKey}
                className={rowClasses + ' border-b border-[#acbcd470]'}
              >
                {baseColumns.map((column, colIndex) => (
                  <td
                    key={`${column.field}-${certKey}`}
                    className={`px-2 py-2 ${!column.wrapText ? 'whitespace-nowrap' : 'break-words'}`}
                  >
                    {['creationDate', 'expirationDate'].includes(column.field)
                      ? formatDateToDMY(certificate[column.field] ? new Date(certificate[column.field]) : undefined)
                      : certificate[column.field] ?? '--'}
                  </td>
                ))}
                <td className="px-2 py-2 whitespace-nowrap ">
                  <div className="flex gap-2 justify-center">
                    <IconButton
                      variant="text"
                      color="blue-gray"
                      size="sm"
                      onClick={() => onEdit(certificate)}
                      disabled={isLoading}
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </IconButton>
                    <IconButton
                      variant="text"
                      color="red"
                      size="sm"
                      onClick={() => onDelete(certificate.id ?? certificate.idDemand)}
                      disabled={isLoading}
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </IconButton>
                  </div>
                </td>
              </tr>
            );
          })}

          {certificates.length > 0 && hasMore && (
            <tr ref={infiniteScrollRef}>
              <td colSpan={columns.length} className="">
                {isLoading && <LoadingSpinner />}
              </td>
            </tr>
          )}
          {certificates.length > 0 && !hasMore && !isLoading && (
            <tr>
              <td colSpan={columns.length} className="p-4 text-center text-gray-400 text-sm">
                All certificates loaded.
              </td>
            </tr>
          )}
          {hasMore && (
            <tr>
              <td colSpan={baseColumns.length + 1} className="text-center py-4">
                <Button
                  color="blue-gray"
                  onClick={onLoadMore}
                  style={{ visibility: isLoading ? 'hidden' : 'visible' }}
                >
                  Load More
                </Button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}