'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

interface AmortizationRow {
  paymentNumber: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export default function AmortizationCalculatorPage() {
  const [inputs, setInputs] = useState({
    loanAmount: '500000',
    interestRate: '5.5',
    loanTerm: '30',
    extraPayment: '0',
  });

  const [schedule, setSchedule] = useState<AmortizationRow[]>([]);
  const [summary, setSummary] = useState({
    monthlyPayment: 0,
    totalInterest: 0,
    totalPayments: 0,
    payoffDate: '',
    monthsSaved: 0,
    interestSaved: 0,
  });

  useEffect(() => {
    calculateAmortization();
  }, [inputs]);

  const calculateAmortization = () => {
    const principal = parseFloat(inputs.loanAmount) || 0;
    const annualRate = parseFloat(inputs.interestRate) || 0;
    const years = parseFloat(inputs.loanTerm) || 0;
    const extraPayment = parseFloat(inputs.extraPayment) || 0;
    
    const monthlyRate = (annualRate / 100) / 12;
    const totalPayments = years * 12;
    const monthlyPayment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
      (Math.pow(1 + monthlyRate, totalPayments) - 1);

    let balance = principal;
    let totalInterest = 0;
    const schedule: AmortizationRow[] = [];
    let paymentNumber = 1;

    // Calculate standard total interest for comparison
    const standardTotalInterest = monthlyPayment * totalPayments - principal;

    while (balance > 0 && paymentNumber <= totalPayments) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(monthlyPayment + extraPayment - interestPayment, balance);
      
      totalInterest += interestPayment;
      balance -= principalPayment;

      schedule.push({
        paymentNumber,
        payment: principalPayment + interestPayment,
        principal: principalPayment,
        interest: interestPayment,
        remainingBalance: balance,
      });

      paymentNumber++;
    }

    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + schedule.length);

    setSummary({
      monthlyPayment,
      totalInterest,
      totalPayments: monthlyPayment * totalPayments,
      payoffDate: payoffDate.toLocaleDateString(),
      monthsSaved: totalPayments - schedule.length,
      interestSaved: standardTotalInterest - totalInterest,
    });

    setSchedule(schedule);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Amortization Schedule Calculator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Loan Amount</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={inputs.loanAmount}
                    onChange={(e) => setInputs({ ...inputs, loanAmount: e.target.value })}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                <input
                  type="number"
                  value={inputs.interestRate}
                  onChange={(e) => setInputs({ ...inputs, interestRate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  step="0.125"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Loan Term (years)</label>
                <select
                  value={inputs.loanTerm}
                  onChange={(e) => setInputs({ ...inputs, loanTerm: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="30">30 years</option>
                  <option value="25">25 years</option>
                  <option value="20">20 years</option>
                  <option value="15">15 years</option>
                  <option value="10">10 years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Extra Monthly Payment</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={inputs.extraPayment}
                    onChange={(e) => setInputs({ ...inputs, extraPayment: e.target.value })}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Summary</h2>
            
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Monthly Payment</dt>
                <dd className="text-2xl font-bold text-gray-900">{formatCurrency(summary.monthlyPayment)}</dd>
              </div>

              <div className="pt-4 border-t">
                <dt className="text-sm text-gray-500">Total Interest</dt>
                <dd className="text-lg font-semibold text-gray-900">{formatCurrency(summary.totalInterest)}</dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">Total of All Payments</dt>
                <dd className="text-lg font-semibold text-gray-900">{formatCurrency(summary.totalPayments)}</dd>
              </div>

              {inputs.extraPayment !== '0' && (
                <div className="pt-4 border-t bg-green-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-green-800">With Extra Payments</dt>
                  <dd className="mt-2 space-y-1">
                    <p className="text-sm text-green-800">
                      You will save{' '}
                      <span className="font-medium">{formatCurrency(summary.interestSaved)}</span>
                      {' '}in interest
                    </p>
                    <p className="text-sm text-green-800">
                      Loan paid off{' '}
                      <span className="font-medium">{Math.floor(summary.monthsSaved)} months</span>
                      {' '}earlier
                    </p>
                    <p className="text-sm text-green-800">
                      Payoff date: <span className="font-medium">{summary.payoffDate}</span>
                    </p>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Amortization Schedule */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Amortization Schedule</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Principal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedule.map((row) => (
                    <tr key={row.paymentNumber}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.paymentNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(row.principal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(row.interest)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(row.remainingBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 