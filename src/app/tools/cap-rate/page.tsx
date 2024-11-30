'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

interface CapRateInputs {
  propertyValue: string;
  grossIncome: {
    monthlyRent: string;
    otherIncome: string;
    vacancyRate: string;
  };
  expenses: {
    propertyTax: string;
    insurance: string;
    utilities: string;
    maintenance: string;
    propertyManagement: string;
    other: string;
  };
}

interface CapRateResults {
  grossIncome: number;
  effectiveGrossIncome: number;
  totalExpenses: number;
  netOperatingIncome: number;
  capRate: number;
  cashFlow: number;
}

export default function CapRateCalculatorPage() {
  const [inputs, setInputs] = useState<CapRateInputs>({
    propertyValue: '500000',
    grossIncome: {
      monthlyRent: '3000',
      otherIncome: '0',
      vacancyRate: '5',
    },
    expenses: {
      propertyTax: '400',
      insurance: '100',
      utilities: '0',
      maintenance: '200',
      propertyManagement: '200',
      other: '0',
    },
  });

  const [results, setResults] = useState<CapRateResults>({
    grossIncome: 0,
    effectiveGrossIncome: 0,
    totalExpenses: 0,
    netOperatingIncome: 0,
    capRate: 0,
    cashFlow: 0,
  });

  useEffect(() => {
    calculateCapRate();
  }, [inputs]);

  const calculateCapRate = () => {
    // Calculate Gross Income
    const monthlyRental = parseFloat(inputs.grossIncome.monthlyRent) || 0;
    const monthlyOther = parseFloat(inputs.grossIncome.otherIncome) || 0;
    const annualGrossIncome = (monthlyRental + monthlyOther) * 12;

    // Calculate Effective Gross Income (after vacancy)
    const vacancyLoss = annualGrossIncome * (parseFloat(inputs.grossIncome.vacancyRate) / 100);
    const effectiveGrossIncome = annualGrossIncome - vacancyLoss;

    // Calculate Total Operating Expenses
    const annualExpenses = Object.values(inputs.expenses).reduce((total, expense) => {
      const monthlyExpense = parseFloat(expense) || 0;
      return total + (monthlyExpense * 12);
    }, 0);

    // Calculate Net Operating Income (NOI)
    const noi = effectiveGrossIncome - annualExpenses;

    // Calculate Cap Rate
    const propertyValueNum = parseFloat(inputs.propertyValue) || 1; // Prevent division by zero
    const capRate = (noi / propertyValueNum) * 100;

    // Calculate Monthly Cash Flow
    const monthlyCashFlow = (noi / 12);

    setResults({
      grossIncome: annualGrossIncome,
      effectiveGrossIncome,
      totalExpenses: annualExpenses,
      netOperatingIncome: noi,
      capRate,
      cashFlow: monthlyCashFlow,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cap Rate Calculator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          {/* Property Value */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Value</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  value={inputs.propertyValue}
                  onChange={(e) => setInputs({ ...inputs, propertyValue: e.target.value })}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Income */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Income</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly Rent</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={inputs.grossIncome.monthlyRent}
                    onChange={(e) => setInputs({
                      ...inputs,
                      grossIncome: { ...inputs.grossIncome, monthlyRent: e.target.value }
                    })}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Other Monthly Income</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={inputs.grossIncome.otherIncome}
                    onChange={(e) => setInputs({
                      ...inputs,
                      grossIncome: { ...inputs.grossIncome, otherIncome: e.target.value }
                    })}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Vacancy Rate (%)</label>
                <input
                  type="number"
                  value={inputs.grossIncome.vacancyRate}
                  onChange={(e) => setInputs({
                    ...inputs,
                    grossIncome: { ...inputs.grossIncome, vacancyRate: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Monthly Expenses */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Expenses</h2>
            <div className="space-y-4">
              {Object.entries(inputs.expenses).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setInputs({
                        ...inputs,
                        expenses: { ...inputs.expenses, [key]: e.target.value }
                      })}
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Results</h2>
            
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Property Value</dt>
                <dd className="text-2xl font-bold text-gray-900">{formatCurrency(parseFloat(inputs.propertyValue) || 0)}</dd>
              </div>
              
              <div className="pt-4 border-t">
                <dt className="text-sm text-gray-500">Annual Gross Income</dt>
                <dd className="text-lg font-semibold text-gray-900">{formatCurrency(results.grossIncome)}</dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">Effective Gross Income (After Vacancy)</dt>
                <dd className="text-lg font-semibold text-gray-900">{formatCurrency(results.effectiveGrossIncome)}</dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">Annual Operating Expenses</dt>
                <dd className="text-lg font-semibold text-gray-900">{formatCurrency(results.totalExpenses)}</dd>
              </div>

              <div className="pt-4 border-t">
                <dt className="text-sm text-gray-500">Net Operating Income (NOI)</dt>
                <dd className="text-2xl font-bold text-blue-600">{formatCurrency(results.netOperatingIncome)}</dd>
              </div>

              <div className="pt-4 border-t">
                <dt className="text-sm text-gray-500">Capitalization Rate</dt>
                <dd className="text-2xl font-bold text-green-600">{results.capRate.toFixed(2)}%</dd>
                <dd className="text-sm text-gray-500">
                  Monthly Cash Flow: {formatCurrency(results.cashFlow)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">About Cap Rate</h3>
            <p className="text-sm text-blue-700">
              The capitalization rate (cap rate) is a measure used to compare different real estate investments. 
              It is calculated by dividing a property's net operating income (NOI) by its market value. 
              A higher cap rate generally indicates a higher potential return but also higher risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 