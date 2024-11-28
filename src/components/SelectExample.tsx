'use client';

import { useState } from 'react';
import Select from './Select';

const MOCK_OPTIONS = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
];

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'pending', label: 'Pending' },
  { value: 'sold', label: 'Sold' },
];

export default function SelectExample() {
  const [values, setValues] = useState({
    basic: '',
    withLabel: '',
    withError: '',
    withHelper: '',
    disabled: 'residential',
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6 max-w-md">
      {/* Basic Select */}
      <Select
        name="basic"
        options={MOCK_OPTIONS}
        value={values.basic}
        onChange={handleChange}
        label="Property Type"
      />

      {/* Select with Label */}
      <Select
        name="withLabel"
        label="Property Type"
        options={MOCK_OPTIONS}
        value={values.withLabel}
        onChange={handleChange}
      />

      {/* Select with Error */}
      <Select
        name="withError"
        label="Status"
        options={STATUS_OPTIONS}
        error="Please select a status"
        value={values.withError}
        onChange={handleChange}
      />

      {/* Select with Helper Text */}
      <Select
        name="withHelper"
        label="Property Type"
        options={MOCK_OPTIONS}
        helperText="This will determine the available features"
        value={values.withHelper}
        onChange={handleChange}
      />

      {/* Disabled Select */}
      <Select
        name="disabled"
        label="Disabled Select"
        options={MOCK_OPTIONS}
        value={values.disabled}
        onChange={handleChange}
        disabled
      />
    </div>
  );
} 