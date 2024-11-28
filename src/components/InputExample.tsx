'use client';

import { useState } from 'react';
import Input from './Input';

export default function InputExample() {
  const [values, setValues] = useState({
    basic: '',
    withLabel: '',
    withError: '',
    withHelper: '',
    withIcon: '',
    disabled: 'Disabled input',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6 max-w-md">
      {/* Basic Input */}
      <Input
        name="basic"
        placeholder="Basic input"
        value={values.basic}
        onChange={handleChange}
      />

      {/* Input with Label */}
      <Input
        name="withLabel"
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={values.withLabel}
        onChange={handleChange}
      />

      {/* Input with Error */}
      <Input
        name="withError"
        label="Password"
        type="password"
        placeholder="Enter password"
        error="Password must be at least 8 characters"
        value={values.withError}
        onChange={handleChange}
      />

      {/* Input with Helper Text */}
      <Input
        name="withHelper"
        label="Username"
        placeholder="Enter username"
        helperText="This will be your public display name"
        value={values.withHelper}
        onChange={handleChange}
      />

      {/* Input with Icons */}
      <Input
        name="withIcon"
        label="Search"
        placeholder="Search..."
        startIcon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
        endIcon={
          values.withIcon && (
            <button 
              onClick={() => setValues(prev => ({ ...prev, withIcon: '' }))}
              className="text-gray-400 hover:text-gray-500"
            >
              ✕
            </button>
          )
        }
        value={values.withIcon}
        onChange={handleChange}
      />

      {/* Disabled Input */}
      <Input
        name="disabled"
        label="Disabled Input"
        value={values.disabled}
        onChange={handleChange}
        disabled
      />
    </div>
  );
} 