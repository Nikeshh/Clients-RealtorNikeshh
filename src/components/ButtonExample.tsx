'use client';

import { useState } from 'react';
import Button from './Button';

export default function ButtonExample() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="small">Small</Button>
          <Button size="medium">Medium</Button>
          <Button size="large">Large</Button>
          <Button size="icon">
            <svg 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Button States</h2>
        <div className="flex flex-wrap gap-4">
          <Button isLoading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button fullWidth>Full Width</Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Button Combinations</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" size="small" isLoading>
            Small Loading
          </Button>
          <Button variant="danger" size="large" disabled>
            Large Disabled
          </Button>
          <Button variant="outline" size="medium" fullWidth>
            Full Width Outline
          </Button>
        </div>
      </div>
    </div>
  );
} 