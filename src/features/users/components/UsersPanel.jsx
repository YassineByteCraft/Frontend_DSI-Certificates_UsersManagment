// src/features/users/components/UsersPanel.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Typography, Button, Input } from '@material-tailwind/react';
import { USER_ROLES, USER_STATUSES } from '../utils/userConstants';

const initialFormData = {
  username: '',
  email: '',
  password: '',
  firstname: '',
  lastname: '',
  idNumber: '',
  role: '',
  status: '',
};

const fieldLabels = {
  username: 'Username',
  email: 'Email',
  password: 'Password',
  firstname: 'First Name',
  lastname: 'Last Name',
  idNumber: 'ID Number',
  role: 'Role',
  status: 'Status',
};

const creationRequiredFields = ["username", "email", "password", "firstname", "lastname", "idNumber", "role", "status"];
const updateRequiredFields = ["username", "email", "firstname", "lastname", "idNumber", "role", "status"];

export default function UsersPanel({
  formMode,
  onFilter,
  onCreate,
  onUpdate,
  onCancel,
  editingUser,
  fieldErrors = {},
  onResetFilters, // <-- add this line
}) {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const filterTimeout = useRef();

  useEffect(() => {
    if (formMode === 'update' && editingUser) {
      const initialUpdateData = { ...initialFormData };
      Object.keys(initialFormData).forEach(key => {
        if (editingUser[key] !== undefined && editingUser[key] !== null) {
          initialUpdateData[key] = editingUser[key];
        }
      });
      setFormData({ ...initialUpdateData, password: '' }); // Ensure password is not pre-filled for updates
      setIsSubmitted(false);
    } else if (formMode === 'create' || formMode === 'filter') {
      setFormData(initialFormData);
      setIsSubmitted(false);
    }
  }, [formMode, editingUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (formMode === 'filter') {
        if (filterTimeout.current) clearTimeout(filterTimeout.current);
        filterTimeout.current = setTimeout(() => {
          const activeFilters = Object.entries(updated).reduce((acc, [k, v]) => {
            if (v !== null && v !== '' && k !== 'password') { // Exclude password from filters
              acc[k] = v;
            }
            return acc;
          }, {});
          onFilter(activeFilters);
        }, 350);
      }
      return updated;
    });
  };

  const handleApplyFilters = () => {
    const activeFilters = Object.entries(formData).reduce((acc, [key, value]) => {
      if (value !== null && value !== "" && key !== 'password') {
        acc[key] = value;
      }
      return acc;
    }, {});
    onFilter(activeFilters);
  };

  const handleSaveUser = () => {
    setIsSubmitted(true);
    const isValid = creationRequiredFields.every((field) => formData[field]);
    // Email format validation
    const emailValid = /^\S+@\S+\.\S+$/.test(formData.email);
    if (!isValid || !emailValid) {
      const payload = { ...formData };
      if (!payload.status) delete payload.status;
      if (!payload.role) delete payload.role;
      return;
    }
    onCreate(formData);
  };

  const handleUpdateUser = () => {
    setIsSubmitted(true);
    const isValid = updateRequiredFields.every((field) => formData[field]);
    // Email format validation
    const emailValid = /^\S+@\S+\.\S+$/.test(formData.email);
    if (!isValid || !emailValid) {
        // Prevent submission if required fields or email are invalid
        return;
    }
    const dataToUpdate = { ...formData };
    if (dataToUpdate.password === '') { // Only send password if it's been changed
      delete dataToUpdate.password;
    }
    onUpdate(editingUser.id, dataToUpdate); // Assuming editingUser has an 'id'
  };

  const handleResetForm = useCallback(() => {
    setFormData(initialFormData);
    setIsSubmitted(false);
    if (formMode === 'filter' && onFilter) {
      onFilter({});
    }
    if (formMode === 'filter' && typeof onResetFilters === 'function') {
      onResetFilters();
    }
  }, [formMode, onFilter, onResetFilters]);

  const handleCancelClick = () => {
    if (onCancel) {
        onCancel();
    } else {
        handleResetForm(); // Fallback behavior
    }
  };

  if (formMode === 'hidden') return null;

  const formTitle =
    formMode === "filter"
      ? "Filter Users"
      : formMode === "create"
      ? "Add New User"
      : formMode === "update"
      ? `Update User: ${editingUser?.username ?? "N/A"}`
      : "";

  const requiredFieldsList =
    formMode === "create"
      ? creationRequiredFields
      : formMode === "update"
      ? updateRequiredFields
      : [];

  return (
    <div className="bg-white pb-2 rounded-lg shadow-md border border-[#64748B]">
      <Typography
        variant="h6"
        color={
          formMode === "filter"
            ? "blue"
            : formMode === "create"
            ? "green"
            : "orange"
        }
        className={`mb-2 px-4 py-1 font-bold ${
          formMode === "filter"
            ? "bg-blue-100"
            : formMode === "create"
            ? "bg-green-100"
            : "bg-orange-100"
        } rounded-t-lg`}
      >
        {formTitle}
      </Typography>

      <div className="grid px-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-2">
        {Object.keys(initialFormData).map((key) => {
          if (formMode === 'filter' && key === 'password') return null;

          const isDisabled = (formMode === 'update' && (key === 'idNumber'));
          const label = fieldLabels[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
          const isRequired = requiredFieldsList.includes(key);
          const clientSideRequiredError = isRequired && isSubmitted && !formData[key];
          const serverSideError = fieldErrors[key];
          // Email format validation
          const isEmailField = key === 'email';
          const emailFormatError = isEmailField && formData[key] && !/^\S+@\S+\.\S+$/.test(formData[key]) ? 'Please enter a valid email address.' : null;
          const hasAnyError = clientSideRequiredError || !!serverSideError || !!emailFormatError;

          const commonInputClass = `!border text-sm ${
            hasAnyError ? "!border-red-500" : "!border-gray-300"
          } bg-white text-gray-900 shadow-lg shadow-gray-900/5 placeholder:text-gray-500 focus:!border-gray-900 p-2.5 rounded-md ${
            isDisabled ? "!bg-gray-100 !cursor-not-allowed" : ""
          }`;

          return (
            <div key={key}>
              <Typography
                variant="small"
                color="blue-gray"
                className="mb-1 font-medium flex justify-start"
              >
                {label}
                {isRequired && !isDisabled && <span className="text-red-500 ml-1">*</span>}
              </Typography>

              {key === 'role' || key === 'status' ? (
                <div className="relative">
                  <select
                    name={key}
                    value={formData[key]}
                    onChange={handleInputChange}
                    className={`${commonInputClass} w-full`}
                    disabled={isDisabled}
                  >
                    <option value="">Select {label}</option>
                    {(key === 'role' ? Object.values(USER_ROLES) : Object.values(USER_STATUSES)).map((optionValue) => (
                      <option key={optionValue} value={optionValue}>{optionValue}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    id={key}
                    name={key}
                    type={key === 'password' ? 'password' : (isEmailField ? 'email' : 'text')}
                    value={formData[key] ?? ''}
                    onChange={handleInputChange}
                    placeholder={label}
                    className={commonInputClass}
                    labelProps={{ className: "hidden" }}
                    crossOrigin="anonymous"
                    disabled={isDisabled}
                  />
                  {!!formData[key] && !isDisabled && key !== 'password' && (
                    <button
                      type="button"
                      onClick={() => {
                        const updatedValue = '';
                        setFormData(prev => {
                            const newState = { ...prev, [key]: updatedValue };
                            if (formMode === 'filter') {
                                if (filterTimeout.current) clearTimeout(filterTimeout.current);
                                filterTimeout.current = setTimeout(() => {
                                    const activeFilters = Object.entries(newState).reduce((acc, [k, v]) => {
                                        if (v !== null && v !== '' && k !== 'password') acc[k] = v;
                                        return acc;
                                    }, {});
                                    onFilter(activeFilters);
                                }, 0);
                            }
                            return newState;
                        });
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      &#10005;
                    </button>
                  )}
                </div>
              )}
              {/* Error display logic */}
              {serverSideError && (
                <Typography variant="small" color="red" className="mt-1">{serverSideError}</Typography>
              )}
              {!serverSideError && emailFormatError && (
                <Typography variant="small" color="red" className="mt-1">{emailFormatError}</Typography>
              )}
              {!serverSideError && !emailFormatError && clientSideRequiredError && (
                <Typography variant="small" color="red" className="mt-1">This field is required.</Typography>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex px-3 gap-4 mt-2 justify-end">
        {formMode === "filter" && (
          <>
            <Button variant="outlined" color="blue-gray" onClick={handleResetForm}>
              Reset Filters
            </Button>
          </>
        )}
        {formMode === "create" && (
          <>
            <Button variant="outlined" color="red" onClick={handleCancelClick}>
              Cancel
            </Button>
            <Button variant="gradient" color="green" onClick={handleSaveUser}>
              Save User
            </Button>
          </>
        )}
        {formMode === "update" && (
          <>
            <Button variant="outlined" color="red" onClick={handleCancelClick}>
              Cancel
            </Button>
            <Button variant="gradient" color="orange" onClick={handleUpdateUser}>
              Update User
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

UsersPanel.propTypes = {
  formMode: PropTypes.oneOf(["filter", "create", "update", "hidden"]).isRequired,
  onFilter: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  onCancel: PropTypes.func,
  editingUser: PropTypes.object,
  fieldErrors: PropTypes.object,
  onResetFilters: PropTypes.func,
};