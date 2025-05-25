import React, { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { Input, Button, Typography } from "@material-tailwind/react";
import Datepicker from "react-tailwindcss-datepicker";
import { formatDateToDMY } from "@/common/utils/dateUtils";

// Empty state for the form data
const initialFormData = {
  idDemand: "",
  demandeName: "",
  model: "",
  type: "",
  organizationalUnit: "",
  commonName: "",
  creationDate: null,
  expirationDate: null,
};

const creationRequiredFields = [
  "idDemand",
  "demandeName",
  "model",
  "type",
  "commonName",
  "expirationDate",
];
const updateRequiredFields = [
  "demandeName",
  "model",
  "type",
  "commonName",
  "expirationDate",
];

const fieldLabels = {
  idDemand: "ID Demand",
  demandeName: "Demande Name",
  model: "Model",
  type: "Type",
  organizationalUnit: "Organizational Unit",
  commonName: "Common Name",
  creationDate: "Creation Date",
  expirationDate: "Expiration Date",
};

export default function CertificatePanel({
  formMode,
  onFilter,
  onCreate,
  onUpdate,
  onCancel,
  editingCertificate,
  onResetFilters,
}) {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Debounce for filter mode
  const filterTimeout = useRef();

  useEffect(() => {
    if (formMode === "update" && editingCertificate) {
      const initialUpdateData = { ...initialFormData };
      Object.keys(initialFormData).forEach((key) => {
        if (editingCertificate[key] !== undefined && editingCertificate[key] !== null) {
          if (key === "creationDate" || key === "expirationDate") {
            try {
              const date = new Date(editingCertificate[key]);
              initialUpdateData[key] = !isNaN(date) ? date : null;
            } catch (e) {
              initialUpdateData[key] = null;
            }
          } else {
            initialUpdateData[key] = editingCertificate[key];
          }
        }
      });
      setFormData(initialUpdateData);
      setIsSubmitted(false);
    } else if (formMode === "filter" || formMode === "create") {
      setFormData(initialFormData);
      setIsSubmitted(false);
    }
  }, [formMode, editingCertificate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (formMode === "filter") {
        if (filterTimeout.current) clearTimeout(filterTimeout.current);
        filterTimeout.current = setTimeout(() => {
          const activeFilters = Object.entries(updated).reduce((acc, [k, v]) => {
            if (v !== null && v !== "") {
              if (k === "creationDate" || k === "expirationDate") {
                const formatted = formatDateToDMY(v);
                if (formatted) acc[k] = formatted;
              } else {
                acc[k] = v;
              }
            }
            return acc;
          }, {});
          onFilter(activeFilters);
        }, 350);
      }
      return updated;
    });
  };

  const handleDateValueChange = (fieldName, newValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: newValue?.startDate ? new Date(newValue.startDate) : null,
    }));
  };

  const handleApplyFilters = () => {
    const activeFilters = Object.entries(formData).reduce((acc, [key, value]) => {
      if (value !== null && value !== "") {
        if (key === "creationDate" || key === "expirationDate") {
          const formatted = formatDateToDMY(value);
          if (formatted) acc[key] = formatted;
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});
    onFilter(activeFilters);
  };

  const handleSave = () => {
    setIsSubmitted(true);
    const isValid = creationRequiredFields.every((field) => formData[field]);
    if (!isValid) return;

    onCreate({
      ...formData,
      creationDate: formData.creationDate,
      expirationDate: formData.expirationDate,
    });
  };

  const handleUpdate = () => {
    setIsSubmitted(true);
    const isValid = updateRequiredFields.every((field) => formData[field]);
    if (!isValid) return;

    const { idDemand, ...rest } = formData;
    const filteredData = Object.entries(rest).reduce((acc, [key, value]) => {
      if (value !== null) acc[key] = value;
      return acc;
    }, {});
    onUpdate(filteredData);
  };

  const handleResetForm = useCallback(() => {
    setFormData(initialFormData);
    setIsSubmitted(false);
    if (formMode === "filter") {
      onFilter && onFilter({});
      if (typeof onResetFilters === "function") onResetFilters();
    }
  }, [formMode, onFilter, onResetFilters]);

  const handleCancelClick = () => {
    onCancel();
  };

  if (formMode === "hidden") return null;

  const requiredFields =
    formMode === "create"
      ? creationRequiredFields
      : formMode === "update"
      ? updateRequiredFields
      : [];

  const formTitle =
    formMode === "filter"
      ? "Filter Certificates"
      : formMode === "create"
      ? "Create New Certificate"
      : formMode === "update"
      ? `Update Certificate (ID-Demand: ${editingCertificate?.idDemand ?? "N/A"})`
      : "";

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
                if (formMode === "filter" && key === "password") return null;
                const isDisabled = formMode === "update" && key === "idDemand";
                const label = fieldLabels[key] || key;
                const isRequired = requiredFields.includes(key);
                const hasError = isRequired && isSubmitted && !formData[key];

                const inputProps = {
                    id: key,
                    name: key,
                    value: formData[key] ?? "",
                    onChange: handleInputChange,
                    placeholder: label,
                    className: `!border text-sm ${
                        hasError ? "!border-red-500" : "!border-gray-300"
                    } bg-white text-gray-900 shadow-lg shadow-gray-900/5 placeholder:text-gray-500 focus:!border-gray-900 p-2.5 rounded-md ${
                        isDisabled ? "!bg-gray-100 !cursor-not-allowed" : ""
                    }`,
                    labelProps: { className: "hidden" },
                    crossOrigin: "anonymous",
                    required: isRequired,
                    error: hasError,
                    disabled: isDisabled,
                };

                return (
                    <div key={key}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="mb-1 font-medium"
                        >
                            {label}
                            {isRequired && !isDisabled && (
                                <span className="text-red-500 ml-1">*</span>
                            )}
                        </Typography>

                        {key === "creationDate" || key === "expirationDate" ? (
                            <div className="relative">
                                <Datepicker
                                    asSingle
                                    useRange={false}
                                    value={{
                                        startDate: formData[key],
                                        endDate: formData[key],
                                    }}
                                    onChange={(val) => {
                                        handleDateValueChange(key, val);
                                        if (formMode === "filter") {
                                            if (filterTimeout.current) clearTimeout(filterTimeout.current);
                                            filterTimeout.current = setTimeout(() => {
                                                const activeFilters = Object.entries({ ...formData, [key]: val?.startDate ? new Date(val.startDate) : null }).reduce((acc, [k, v]) => {
                                                    if (v !== null && v !== "") {
                                                        if (k === "creationDate" || k === "expirationDate") {
                                                            const formatted = formatDateToDMY(v);
                                                            if (formatted) acc[k] = formatted;
                                                        } else {
                                                            acc[k] = v;
                                                        }
                                                    }
                                                    return acc;
                                                }, {});
                                                onFilter(activeFilters);
                                            }, 350);
                                        }
                                    }}
                                    placeholder={`Select ${label}`}
                                    inputClassName={`w-full !border text-sm ${
                                        hasError ? "!border-red-500" : "!border-gray-300"
                                    } bg-white text-gray-900 shadow-lg shadow-gray-900/5 placeholder:text-gray-500 focus:!border-gray-900 p-2.5 rounded-md ${
                                        isDisabled ? "bg-gray-100 cursor-not-allowed" : ""
                                    }`}
                                    containerClassName="relative w-full z-50"
                                    toggleClassName="absolute right-0 h-full px-3 text-gray-400"
                                    displayFormat={"DD-MM-YYYY"}
                                    disabled={isDisabled}
                                />
                                {!!formData[key] && !isDisabled && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleDateValueChange(key, null);
                                            if (formMode === "filter") {
                                                setTimeout(() => {
                                                    const activeFilters = Object.entries({ ...formData, [key]: null }).reduce((acc, [k, v]) => {
                                                        if (v !== null && v !== "") {
                                                            if (k === "creationDate" || k === "expirationDate") {
                                                                const formatted = formatDateToDMY(v);
                                                                if (formatted) acc[k] = formatted;
                                                            } else {
                                                                acc[k] = v;
                                                            }
                                                        }
                                                        return acc;
                                                    }, {});
                                                    onFilter(activeFilters);
                                                }, 0);
                                            }
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    >
                                        &#10005;
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                <Input {...inputProps} />
                                {!!formData[key] && !isDisabled && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData((prev) => {
                                                const updated = { ...prev, [key]: "" };
                                                if (formMode === "filter") {
                                                    setTimeout(() => {
                                                        const activeFilters = Object.entries(updated).reduce((acc, [k, v]) => {
                                                            if (v !== null && v !== "") {
                                                                if (k === "creationDate" || k === "expirationDate") {
                                                                    const formatted = formatDateToDMY(v);
                                                                    if (formatted) acc[k] = formatted;
                                                                } else {
                                                                    acc[k] = v;
                                                                }
                                                            }
                                                            return acc;
                                                        }, {});
                                                        onFilter(activeFilters);
                                                    }, 0);
                                                }
                                                return updated;
                                            });
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    >
                                        &#10005;
                                    </button>
                                )}
                            </div>
                        )}
                        {hasError && (
                            <Typography variant="small" color="red" className="mt-1">
                                This field is required.
                            </Typography>
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
                    <Button variant="gradient" color="green" onClick={handleSave}>
                        Save Certificate
                    </Button>
                </>
            )}
            {formMode === "update" && (
                <>
                    <Button variant="outlined" color="red" onClick={handleCancelClick}>
                        Cancel
                    </Button>
                    <Button variant="gradient" color="orange" onClick={handleUpdate}>
                        Update Certificate
                    </Button>
                </>
            )}
        </div>
    </div>
);
}

CertificatePanel.propTypes = {
  formMode: PropTypes.oneOf(["filter", "create", "update", "hidden"]).isRequired,
  onFilter: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  onCancel: PropTypes.func,
  editingCertificate: PropTypes.object,
  onResetFilters: PropTypes.func,
};
