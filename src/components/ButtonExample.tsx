'use client';

import { useState } from 'react';
import Button from './Button';

export default function ButtonExample() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Basic Variants */}
      <div className="space-x-4">
        <Button>Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="danger">Danger Button</Button>
      </div>

      {/* Sizes */}
      <div className="space-x-4">
        <Button size="small">Small</Button>
        <Button size="medium">Medium</Button>
        <Button size="large">Large</Button>
      </div>

      {/* Loading States */}
      <div className="space-x-4">
        <Button
          isLoading={isLoading}
          loadingText="Saving..."
          onClick={handleClick}
        >
          Click Me
        </Button>
        <Button
          variant="secondary"
          isLoading={isLoading}
          loadingText="Loading..."
          onClick={handleClick}
        >
          Secondary Loading
        </Button>
      </div>

      {/* With Icons */}
      <div className="space-x-4">
        <Button icon="➕">Add New</Button>
        <Button icon="📤" variant="secondary">Export</Button>
        <Button icon="🗑️" variant="danger">Delete</Button>
      </div>

      {/* Disabled State */}
      <div className="space-x-4">
        <Button disabled>Disabled</Button>
        <Button variant="secondary" disabled>Disabled</Button>
      </div>
    </div>
  );
} 