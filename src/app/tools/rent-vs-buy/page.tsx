'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

export default function RentVsBuyCalculatorPage() {
  const [inputs, setInputs] = useState({
    // Purchase Costs
    homePrice: 500000,
    downPayment: 100000,
    interestRate: 5.5,
    loanTerm: 30,
    propertyTax: 3000,
    homeInsurance: 1200,
    maintenanceCost: 2400,
    homeValueAppreciation: 3,
    
    // Rental Costs
    monthlyRent: 2500,
    rentersInsurance: 200,
    rentIncrease: 3,
    
    // Investment
    investmentReturn: 7,
  });

  const [results, setResults] = useState({
    monthly: {
      buying: {
        mortgage: 0,
        propertyTax: 0,
        insurance: 0,
        maintenance: 0,
        total: 0
      },
      renting: {
        rent: 0,
        insurance: 0,
        total: 0
      }
    },
    fiveYear: {
      buying: {
        totalCost: 0,
        equity: 0,
        homeValue: 0,
        netCost: 0
      },
      renting: {
        totalCost: 0,
        investment: 0,
        netCost: 0
      }
    }
  });

  useEffect(() => {
    calculateComparison();
  }, [inputs]);

  const calculateComparison = () => {
    // Calculate monthly mortgage payment
    const principal = inputs.homePrice - inputs.downPayment;
    const monthlyRate = (inputs.interestRate / 100) / 12;
    const numberOfPayments = inputs.loanTerm * 12;
    
    const monthlyMortgage = 
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    // Monthly costs for buying
    const monthlyBuying = {
      mortgage: monthlyMortgage,
      propertyTax: inputs.propertyTax / 12,
      insurance: inputs.homeInsurance / 12,
      maintenance: inputs.maintenanceCost / 12,
      total: monthlyMortgage + 
             (inputs.propertyTax / 12) + 
             (inputs.homeInsurance / 12) + 
             (inputs.maintenanceCost / 12)
    };

    // Monthly costs for renting
    const monthlyRenting = {
      rent: inputs.monthlyRent,
      insurance: inputs.rentersInsurance / 12,
      total: inputs.monthlyRent + (inputs.rentersInsurance / 12)
    };

    // 5-year calculations
    const fiveYearBuying = {
      totalCost: monthlyBuying.total * 12 * 5,
      equity: calculateEquityAfterYears(5),
      homeValue: inputs.homePrice * Math.pow(1 + inputs.homeValueAppreciation / 100, 5),
      netCost: 0
    };

    const fiveYearRenting = {
      totalCost: calculateTotalRentCost(5),
      investment: calculateInvestmentGrowth(5),
      netCost: 0
    };

    // Calculate net costs
    fiveYearBuying.netCost = fiveYearBuying.totalCost + inputs.downPayment - 
                            (fiveYearBuying.homeValue - principal + fiveYearBuying.equity);
    
    fiveYearRenting.netCost = fiveYearRenting.totalCost - fiveYearRenting.investment;

    setResults({
      monthly: {
        buying: monthlyBuying,
        renting: monthlyRenting
      },
      fiveYear: {
        buying: fiveYearBuying,
        renting: fiveYearRenting
      }
    });
  };

  const calculateEquityAfterYears = (years: number) => {
    const monthlyRate = (inputs.interestRate / 100) / 12;
    const numberOfPayments = inputs.loanTerm * 12;
    const monthlyPayment = 
      ((inputs.homePrice - inputs.downPayment) * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    let remainingBalance = inputs.homePrice - inputs.downPayment;
    let totalEquity = inputs.downPayment;

    for (let i = 0; i < years * 12; i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
      totalEquity += principalPayment;
    }

    return totalEquity;
  };

  const calculateTotalRentCost = (years: number) => {
    let totalCost = 0;
    let currentRent = inputs.monthlyRent;

    for (let year = 0; year < years; year++) {
      totalCost += currentRent * 12;
      currentRent *= (1 + inputs.rentIncrease / 100);
    }

    return totalCost + (inputs.rentersInsurance * years);
  };

  const calculateInvestmentGrowth = (years: number) => {
    const monthlyInvestment = results.monthly.buying.total - results.monthly.renting.total;
    if (monthlyInvestment <= 0) return 0;

    const monthlyRate = (inputs.investmentReturn / 100) / 12;
    let totalInvestment = inputs.downPayment;

    for (let i = 0; i < years * 12; i++) {
      totalInvestment *= (1 + monthlyRate);
      totalInvestment += monthlyInvestment;
    }

    return totalInvestment;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Rent vs. Buy Calculator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchase Costs</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Home Price</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={inputs.homePrice}
                    onChange={(e) => setInputs({ ...inputs, homePrice: parseFloat(e.target.value) || 0 })}
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Annual Property Tax</label>
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
                <label className="block text-sm font-medium text-gray-700">Annual Home Insurance</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={inputs.homeInsurance}
                    onChange={(e) => setInputs({ ...inputs, homeInsurance: parseFloat(e.target.value) || 0 })}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Annual Maintenance Cost</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={inputs.maintenanceCost}
                    onChange={(e) => setInputs({ ...inputs, maintenanceCost: parseFloat(e.target.value) || 0 })}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Home Value Appreciation (%)</label>
                <input
                  type="number"
                  value={inputs.homeValueAppreciation}
                  onChange={(e) => setInputs({ ...inputs, homeValueAppreciation: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rental Costs</h2>
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
                <label className="block text-sm font-medium text-gray-700">Annual Renters Insurance</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={inputs.rentersInsurance}
                    onChange={(e) => setInputs({ ...inputs, rentersInsurance: parseFloat(e.target.value) || 0 })}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Annual Rent Increase (%)</label>
                <input
                  type="number"
                  value={inputs.rentIncrease}
                  onChange={(e) => setInputs({ ...inputs, rentIncrease: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Investment Assumptions</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Investment Return Rate (%)</label>
              <input
                type="number"
                value={inputs.investmentReturn}
                onChange={(e) => setInputs({ ...inputs, investmentReturn: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                step="0.1"
              />
              <p className="mt-1 text-sm text-gray-500">
                Expected return rate if you invest the down payment and monthly savings from renting
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Costs</h2>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Buying Costs */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Buying</h3>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Mortgage</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.monthly.buying.mortgage)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Property Tax</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.monthly.buying.propertyTax)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Insurance</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.monthly.buying.insurance)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Maintenance</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.monthly.buying.maintenance)}</dd>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <dt className="text-sm font-medium text-gray-900">Total</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(results.monthly.buying.total)}</dd>
                  </div>
                </dl>
              </div>

              {/* Renting Costs */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Renting</h3>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Rent</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.monthly.renting.rent)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Insurance</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.monthly.renting.insurance)}</dd>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <dt className="text-sm font-medium text-gray-900">Total</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(results.monthly.renting.total)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Monthly Difference</span>
                <span className={`text-sm font-medium ${
                  results.monthly.buying.total > results.monthly.renting.total
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {formatCurrency(Math.abs(results.monthly.buying.total - results.monthly.renting.total))}
                  {results.monthly.buying.total > results.monthly.renting.total ? ' more' : ' less'} to buy
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">5-Year Comparison</h2>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Buying Scenario */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Buying</h3>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Total Payments</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.fiveYear.buying.totalCost)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Home Value</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.fiveYear.buying.homeValue)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Equity Built</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.fiveYear.buying.equity)}</dd>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <dt className="text-sm font-medium text-gray-900">Net Cost</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(results.fiveYear.buying.netCost)}</dd>
                  </div>
                </dl>
              </div>

              {/* Renting Scenario */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Renting</h3>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Total Rent Paid</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.fiveYear.renting.totalCost)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Investment Value</dt>
                    <dd className="text-sm font-medium">{formatCurrency(results.fiveYear.renting.investment)}</dd>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <dt className="text-sm font-medium text-gray-900">Net Cost</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(results.fiveYear.renting.netCost)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">5-Year Net Difference</span>
                <span className={`text-sm font-medium ${
                  results.fiveYear.buying.netCost > results.fiveYear.renting.netCost
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {formatCurrency(Math.abs(results.fiveYear.buying.netCost - results.fiveYear.renting.netCost))}
                  {results.fiveYear.buying.netCost > results.fiveYear.renting.netCost ? ' cheaper to rent' : ' cheaper to buy'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 