'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

interface TaxRates {
  [key: string]: {
    rate: number;
    description: string;
  };
}

export default function PropertyTaxCalculator() {
  const [propertyValue, setPropertyValue] = useState<string>('500000');
  const [location, setLocation] = useState<string>('');
  const [customRate, setCustomRate] = useState<string>('1.5');
  const [assessmentRatio, setAssessmentRatio] = useState<string>('100');
  const [exemptions, setExemptions] = useState<string>('0');
  const [useCustomRate, setUseCustomRate] = useState(true);

  // Example tax rates by location - in a real app, these would come from an API
  const taxRates: TaxRates = {
    'Toronto, ON': { rate: 0.614889, description: 'Toronto Property Tax Rate' },
    'Vancouver, BC': { rate: 0.29850, description: 'Vancouver Property Tax Rate' },
    'Montreal, QC': { rate: 0.76940, description: 'Montreal Property Tax Rate' },
    'Calgary, AB': { rate: 0.63640, description: 'Calgary Property Tax Rate' },
  };

  const calculateTax = () => {
    const value = parseFloat(propertyValue) || 0;
    const ratio = parseFloat(assessmentRatio) / 100;
    const exempt = parseFloat(exemptions) || 0;
    const rate = useCustomRate 
      ? parseFloat(customRate) / 100
      : (taxRates[location]?.rate || 0) / 100;

    const assessedValue = value * ratio;
    const taxableValue = Math.max(assessedValue - exempt, 0);
    const annualTax = taxableValue * rate;
    const monthlyTax = annualTax / 12;

    return {
      assessedValue,
      taxableValue,
      annualTax,
      monthlyTax,
      effectiveRate: (annualTax / value) * 100
    };
  };

  const results = calculateTax();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Property Tax Calculator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Property Value</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(e.target.value)}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Assessment Ratio (%)</label>
                <input
                  type="number"
                  value={assessmentRatio}
                  onChange={(e) => setAssessmentRatio(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="100"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Percentage of market value used for tax assessment
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Exemptions</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={exemptions}
                    onChange={(e) => setExemptions(e.target.value)}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Total value of any tax exemptions
                </p>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate</label>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={useCustomRate}
                      onChange={() => setUseCustomRate(true)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Custom Rate</span>
                  </label>
                  
                  {useCustomRate && (
                    <div className="ml-6">
                      <div className="relative rounded-md shadow-sm">
                        <input
                          type="number"
                          value={customRate}
                          onChange={(e) => setCustomRate(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          step="0.001"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!useCustomRate}
                      onChange={() => setUseCustomRate(false)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Select Location</span>
                  </label>
                  
                  {!useCustomRate && (
                    <div className="ml-6">
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Select a location</option>
                        {Object.entries(taxRates).map(([loc, { rate, description }]) => (
                          <option key={loc} value={loc}>
                            {loc} ({rate}%)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tax Summary</h2>
            
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Property Value</dt>
                <dd className="text-2xl font-bold text-gray-900">{formatCurrency(parseFloat(propertyValue) || 0)}</dd>
              </div>
              
              <div className="pt-4 border-t">
                <dt className="text-sm text-gray-500">Assessed Value</dt>
                <dd className="text-lg font-semibold text-gray-900">{formatCurrency(results.assessedValue)}</dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">Taxable Value</dt>
                <dd className="text-lg font-semibold text-gray-900">{formatCurrency(results.taxableValue)}</dd>
                {parseFloat(exemptions) > 0 && (
                  <dd className="text-sm text-gray-500">
                    After {formatCurrency(parseFloat(exemptions))} in exemptions
                  </dd>
                )}
              </div>

              <div className="pt-4 border-t">
                <dt className="text-sm text-gray-500">Tax Rate</dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {useCustomRate ? customRate : (taxRates[location]?.rate || 0).toFixed(3)}%
                </dd>
                <dd className="text-sm text-gray-500">
                  Effective rate: {results.effectiveRate.toFixed(3)}%
                </dd>
              </div>

              <div className="pt-4 border-t">
                <dt className="text-sm text-gray-500">Annual Property Tax</dt>
                <dd className="text-2xl font-bold text-blue-600">{formatCurrency(results.annualTax)}</dd>
                <dd className="text-sm text-gray-500">
                  {formatCurrency(results.monthlyTax)} per month
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">About Property Taxes</h3>
            <p className="text-sm text-blue-700">
              Property taxes are calculated based on the assessed value of your property and the local tax rate. 
              The assessment ratio determines what percentage of your property's market value is used for tax purposes. 
              Some properties may qualify for exemptions, which reduce the taxable value.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 