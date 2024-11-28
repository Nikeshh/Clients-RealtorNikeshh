'use client';

import { useState, useEffect } from 'react';

export default function MortgageCalculatorPage() {
  const [formData, setFormData] = useState({
    propertyPrice: '500000',
    downPayment: '100000',
    interestRate: '5.5',
    loanTerm: '30',
    propertyTax: '3000',
    insurance: '1200',
  });

  const [monthlyPayment, setMonthlyPayment] = useState({
    principal: 0,
    tax: 0,
    insurance: 0,
    total: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.replace(/[^0-9.]/g, '')
    }));
  };

  const calculateMortgage = () => {
    const p = parseFloat(formData.propertyPrice) - parseFloat(formData.downPayment); // Principal
    const r = parseFloat(formData.interestRate) / 100 / 12; // Monthly interest rate
    const n = parseFloat(formData.loanTerm) * 12; // Total number of payments

    // Monthly principal and interest
    const monthlyPrincipal = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    // Monthly tax and insurance
    const monthlyTax = parseFloat(formData.propertyTax) / 12;
    const monthlyInsurance = parseFloat(formData.insurance) / 12;

    setMonthlyPayment({
      principal: monthlyPrincipal,
      tax: monthlyTax,
      insurance: monthlyInsurance,
      total: monthlyPrincipal + monthlyTax + monthlyInsurance
    });
  };

  useEffect(() => {
    calculateMortgage();
  }, [formData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <h1 className="text-2xl font-bold text-blue-900 mb-8">Mortgage Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Loan Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Price
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                <input
                  type="text"
                  name="propertyPrice"
                  value={formData.propertyPrice}
                  onChange={handleChange}
                  className="pl-8 block w-full rounded-lg border border-blue-200 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Down Payment
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                <input
                  type="text"
                  name="downPayment"
                  value={formData.downPayment}
                  onChange={handleChange}
                  className="pl-8 block w-full rounded-lg border border-blue-200 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate (%)
              </label>
              <input
                type="text"
                name="interestRate"
                value={formData.interestRate}
                onChange={handleChange}
                className="block w-full rounded-lg border border-blue-200 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Term (years)
              </label>
              <input
                type="text"
                name="loanTerm"
                value={formData.loanTerm}
                onChange={handleChange}
                className="block w-full rounded-lg border border-blue-200 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Property Tax
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                <input
                  type="text"
                  name="propertyTax"
                  value={formData.propertyTax}
                  onChange={handleChange}
                  className="pl-8 block w-full rounded-lg border border-blue-200 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Insurance
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                <input
                  type="text"
                  name="insurance"
                  value={formData.insurance}
                  onChange={handleChange}
                  className="pl-8 block w-full rounded-lg border border-blue-200 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Display */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Monthly Payment Breakdown</h2>
          
          <div className="space-y-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Principal & Interest</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(monthlyPayment.principal)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Property Tax</div>
                <div className="text-lg font-semibold text-gray-700">
                  {formatCurrency(monthlyPayment.tax)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Insurance</div>
                <div className="text-lg font-semibold text-gray-700">
                  {formatCurrency(monthlyPayment.insurance)}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-gray-600 mb-1">Total Monthly Payment</div>
              <div className="text-3xl font-bold text-blue-900">
                {formatCurrency(monthlyPayment.total)}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Loan Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Loan Amount</div>
                  <div className="font-medium text-blue-900">
                    {formatCurrency(parseFloat(formData.propertyPrice) - parseFloat(formData.downPayment))}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Down Payment</div>
                  <div className="font-medium text-blue-900">
                    {formatCurrency(parseFloat(formData.downPayment))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 