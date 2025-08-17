import React from 'react';
import type { FormField, UdyamFormData } from '@/types/form-types';

interface FormFieldProps {
  field: FormField;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  formData?: Partial<UdyamFormData>;
}

const FormFieldComponent: React.FC<FormFieldProps> = ({
  field,
  value,
  error,
  onChange,
  formData
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const renderField = () => {
    const baseInputClasses = `w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : ''}`;
    
    switch (field.type) {
      case 'select':
        return (
          <select
            id={field.name}
            name={field.name}
            value={value}
            onChange={handleChange}
            required={field.required}
            className={baseInputClasses}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={value}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            maxLength={field.validation?.maxLength}
            className={`${baseInputClasses} min-h-[100px]`}
          />
        );

      default:
        return (
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            value={value}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required}
            maxLength={field.name === 'aadhaarNumber' ? 14 : field.validation?.maxLength} // Allow space for formatting: 4+1+4+1+4 = 14
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <div className="mb-6">
      <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderField()}
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      
      {/* Helper text for specific fields */}
      {field.name === 'aadhaarNumber' && (
        <p className="text-xs text-gray-500 mt-1">
          Enter your 12-digit Aadhaar number (spaces will be added automatically)
        </p>
      )}
      
      {field.name === 'panNumber' && (
        <p className="text-xs text-gray-500 mt-1">
          Format: ABCDE1234F (5 letters, 4 digits, 1 letter)
        </p>
      )}
      
      {field.name === 'mobileNumber' && (
        <p className="text-xs text-gray-500 mt-1">
          Enter your 10-digit mobile number
        </p>
      )}
      
      {field.name === 'pincode' && (
        <p className="text-xs text-gray-500 mt-1">
          Enter 6-digit PIN code (state and district will be auto-filled)
        </p>
      )}
    </div>
  );
};

export default FormFieldComponent;
