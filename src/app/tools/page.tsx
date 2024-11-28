'use client';

import { useState } from 'react';

export default function ToolsPage() {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('30');
  const [downPayment, setDownPayment] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [showAmortization, setShowAmortization] = useState(false);

  const calculateMortgage = () => {
    const principal = Number(loanAmount) - Number(downPayment);
    const monthlyRate = (Number(interestRate) / 100) / 12;
    const numberOfPayments = Number(loanTerm) * 12;

    const monthlyPaymentAmount = 
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    setMonthlyPayment(monthlyPaymentAmount);
    setShowAmortization(true);
  };

  const calculateAmortizationSchedule = () => {
    const schedule = [];
    let remainingBalance = Number(loanAmount) - Number(downPayment);
    const monthlyRate = (Number(interestRate) / 100) / 12;
    const numberOfPayments = Number(loanTerm) * 12;
    
    for (let month = 1; month <= Math.min(numberOfPayments, 24); month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = (monthlyPayment || 0) - interestPayment;
      remainingBalance -= principalPayment;

      schedule.push({
        month,
        payment: monthlyPayment || 0,
        principalPayment,
        interestPayment,
        remainingBalance,
      });
    }

    return schedule;
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mortgage Calculator</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Price ($)
              </label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Enter property price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Down Payment ($)
              </label>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Enter down payment"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate (%)
              </label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Enter interest rate"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Term (years)
              </label>
              <select
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="30">30 years</option>
                <option value="25">25 years</option>
                <option value="20">20 years</option>
                <option value="15">15 years</option>
                <option value="10">10 years</option>
              </select>
            </div>
          </div>

          <button
            onClick={calculateMortgage}
            className="mt-6 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Calculate
          </button>
        </div>

        {monthlyPayment && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            
            <div className="mb-6">
              <p className="text-gray-600">Monthly Payment</p>
              <p className="text-3xl font-bold">${monthlyPayment.toFixed(2)}</p>
            </div>

            {showAmortization && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Amortization Schedule (First 24 Months)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Month</th>
                        <th className="px-4 py-2 text-left">Payment</th>
                        <th className="px-4 py-2 text-left">Principal</th>
                        <th className="px-4 py-2 text-left">Interest</th>
                        <th className="px-4 py-2 text-left">Remaining</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {calculateAmortizationSchedule().map((row) => (
                        <tr key={row.month}>
                          <td className="px-4 py-2">{row.month}</td>
                          <td className="px-4 py-2">${row.payment.toFixed(2)}</td>
                          <td className="px-4 py-2">${row.principalPayment.toFixed(2)}</td>
                          <td className="px-4 py-2">${row.interestPayment.toFixed(2)}</td>
                          <td className="px-4 py-2">${Math.max(0, row.remainingBalance).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
} 