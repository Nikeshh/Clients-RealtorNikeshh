'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

interface ROICalculation {
  monthlyIncome: {
    rentalIncome: number;
    otherIncome: number;
    totalIncome: number;
  };
  monthlyExpenses: {
    mortgage: number;
    propertyTax: number;
    insurance: number;
    utilities: number;
    maintenance: number;
    propertyManagement: number;
    vacancy: number;
    totalExpenses: number;
  };
  cashFlow: {
    monthly: number;
    annual: number;
  };
  returns: {
    cashOnCash: number;
    capRate: number;
    totalROI: number;
  };
}

export default function ROICalculatorPage() {
  const [inputs, setInputs] = useState({
    // Purchase Info
    purchasePrice: 500000,
    downPayment: 100000,
    closingCosts: 5000,
    rehabCosts: 0,
    
    // Financing
    interestRate: 5.5,
    loanTerm: 30,
    
    // Income
    monthlyRent: 3000,
    otherMonthlyIncome: 0,
    
    // Monthly Expenses
    propertyTax: 400,
    insurance: 100,
    utilities: 0,
    maintenance: 200,
    propertyManagement: 0,
    vacancyRate: 5,
    
    // Appreciation
    annualAppreciation: 3,
    holdingPeriod: 5,
  });

  const [results, setResults] = useState<ROICalculation>({
    monthlyIncome: {
      rentalIncome: 0,
      otherIncome: 0,
      totalIncome: 0
    },
    monthlyExpenses: {
      mortgage: 0,
      propertyTax: 0,
      insurance: 0,
      utilities: 0,
      maintenance: 0,
      propertyManagement: 0,
      vacancy: 0,
      totalExpenses: 0
    },
    cashFlow: {
      monthly: 0,
      annual: 0
    },
    returns: {
      cashOnCash: 0,
      capRate: 0,
      totalROI: 0
    }
  });

  useEffect(() => {
    calculateROI();
  }, [inputs]);

  const calculateROI = () => {
    // Calculate mortgage payment
    const principal = inputs.purchasePrice - inputs.downPayment;
    const monthlyRate = (inputs.interestRate / 100) / 12;
    const numberOfPayments = inputs.loanTerm * 12;
    
    const monthlyMortgage = principal > 0 ? 
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1) : 0;

    // Calculate monthly income
    const monthlyIncome = {
      rentalIncome: inputs.monthlyRent,
      otherIncome: inputs.otherMonthlyIncome,
      totalIncome: inputs.monthlyRent + inputs.otherMonthlyIncome
    };

    // Calculate monthly expenses
    const vacancy = (inputs.monthlyRent * inputs.vacancyRate) / 100;
    const propertyManagement = inputs.propertyManagement > 0 ? 
      (inputs.monthlyRent * inputs.propertyManagement) / 100 : 0;

    const monthlyExpenses = {
      mortgage: monthlyMortgage,
      propertyTax: inputs.propertyTax,
      insurance: inputs.insurance,
      utilities: inputs.utilities,
      maintenance: inputs.maintenance,
      propertyManagement,
      vacancy,
      totalExpenses: monthlyMortgage + 
                    inputs.propertyTax + 
                    inputs.insurance + 
                    inputs.utilities + 
                    inputs.maintenance + 
                    propertyManagement + 
                    vacancy
    };

    // Calculate cash flow
    const monthlyCashFlow = monthlyIncome.totalIncome - monthlyExpenses.totalExpenses;
    const annualCashFlow = monthlyCashFlow * 12;

    // Calculate total investment
    const totalInvestment = inputs.downPayment + 
                          inputs.closingCosts + 
                          inputs.rehabCosts;

    // Calculate returns
    const cashOnCash = (annualCashFlow / totalInvestment) * 100;
    const netOperatingIncome = (monthlyIncome.totalIncome - 
      (monthlyExpenses.totalExpenses - monthlyExpenses.mortgage)) * 12;
    const capRate = (netOperatingIncome / inputs.purchasePrice) * 100;

    // Calculate future value with appreciation
    const futureValue = inputs.purchasePrice * 
      Math.pow(1 + inputs.annualAppreciation / 100, inputs.holdingPeriod);
    const totalProfit = (futureValue - inputs.purchasePrice) + 
      (annualCashFlow * inputs.holdingPeriod);
    const totalROI = (totalProfit / totalInvestment) * 100;

    setResults({
      monthlyIncome,
      monthlyExpenses,
      cashFlow: {
        monthly: monthlyCashFlow,
        annual: annualCashFlow
      },
      returns: {
        cashOnCash,
        capRate,
        totalROI
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Property ROI Calculator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchase Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={inputs.purchasePrice}
                    onChange={(e) => setInputs({ ...inputs, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Down Payment</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={inputs.downPayment}
                    onChange={(e) => setInputs({ ...inputs, downPayment: parseFloat(e.target.value) || 0 })}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {((inputs.downPayment / inputs.purchasePrice) * 100).toFixed(1)}% down
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                  <input
                    type="number"
                    value={inputs.interestRate}
                    onChange={(e) => setInputs({ ...inputs, interestRate: parseFloat(e.target.value) || 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loan Term (years)</label>
                  <select
                    value={inputs.loanTerm}
                    onChange={(e) => setInputs({ ...inputs, loanTerm: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value={30}>30 years</option>
                    <option value={25}>25 years</option>
                    <option value={20}>20 years</option>
                    <option value={15}>15 years</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Closing Costs</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={inputs.closingCosts}
                      onChange={(e) => setInputs({ ...inputs, closingCosts: parseFloat(e.target.value) || 0 })}
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rehab Costs</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={inputs.rehabCosts}
                      onChange={(e) => setInputs({ ...inputs, rehabCosts: parseFloat(e.target.value) || 0 })}
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                    value={inputs.monthlyRent}
                    onChange={(e) => setInputs({ ...inputs, monthlyRent: parseFloat(e.target.value) || 0 })}
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
                    value={inputs.otherMonthlyIncome}
                    onChange={(e) => setInputs({ ...inputs, otherMonthlyIncome: parseFloat(e.target.value) || 0 })}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Expenses</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Tax</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={inputs.propertyTax}
                      onChange={(e) => setInputs({ ...inputs, propertyTax: parseFloat(e.target.value) || 0 })}
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Insurance</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={inputs.insurance}
                      onChange={(e) => setInputs({ ...inputs, insurance: parseFloat(e.target.value) || 0 })}
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Utilities</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={inputs.utilities}
                      onChange={(e) => setInputs({ ...inputs, utilities: parseFloat(e.target.value) || 0 })}
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maintenance</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={inputs.maintenance}
                      onChange={(e) => setInputs({ ...inputs, maintenance: parseFloat(e.target.value) || 0 })}
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Management (%)</label>
                  <input
                    type="number"
                    value={inputs.propertyManagement}
                    onChange={(e) => setInputs({ ...inputs, propertyManagement: parseFloat(e.target.value) || 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vacancy Rate (%)</label>
                  <input
                    type="number"
                    value={inputs.vacancyRate}
                    onChange={(e) => setInputs({ ...inputs, vacancyRate: parseFloat(e.target.value) || 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Appreciation</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Annual Appreciation (%)</label>
                <input
                  type="number"
                  value={inputs.annualAppreciation}
                  onChange={(e) => setInputs({ ...inputs, annualAppreciation: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Holding Period (years)</label>
                <input
                  type="number"
                  value={inputs.holdingPeriod}
                  onChange={(e) => setInputs({ ...inputs, holdingPeriod: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Cash Flow</h2>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Income */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Income</h3>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Rental Income</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.monthlyIncome.rentalIncome)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Other Income</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.monthlyIncome.otherIncome)}</dd>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <dt className="text-sm font-medium text-gray-900">Total Income</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(results.monthlyIncome.totalIncome)}</dd>
                  </div>
                </dl>
              </div>

              {/* Expenses */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Expenses</h3>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Mortgage</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.monthlyExpenses.mortgage)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Property Tax</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.monthlyExpenses.propertyTax)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Insurance</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.monthlyExpenses.insurance)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Utilities</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.monthlyExpenses.utilities)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Maintenance</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.monthlyExpenses.maintenance)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Property Management</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.monthlyExpenses.propertyManagement)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Vacancy</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.monthlyExpenses.vacancy)}</dd>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <dt className="text-sm font-medium text-gray-900">Total Expenses</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(results.monthlyExpenses.totalExpenses)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Monthly Cash Flow</span>
                <span className={`text-sm font-medium ${
                  results.cashFlow.monthly >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(results.cashFlow.monthly)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm font-medium text-gray-900">Annual Cash Flow</span>
                <span className={`text-sm font-medium ${
                  results.cashFlow.annual >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(results.cashFlow.annual)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Investment Returns</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Cash on Cash Return</span>
                  <span className="text-sm font-medium text-gray-900">{results.returns.cashOnCash.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(results.returns.cashOnCash, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Cap Rate</span>
                  <span className="text-sm font-medium text-gray-900">{results.returns.capRate.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${Math.min(results.returns.capRate, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Total ROI ({inputs.holdingPeriod} years)</span>
                  <span className="text-sm font-medium text-gray-900">{results.returns.totalROI.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${Math.min(results.returns.totalROI, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Investment</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(inputs.downPayment + inputs.closingCosts + inputs.rehabCosts)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Future Property Value</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(inputs.purchasePrice * Math.pow(1 + inputs.annualAppreciation / 100, inputs.holdingPeriod))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Cash Flow</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(results.cashFlow.annual * inputs.holdingPeriod)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 