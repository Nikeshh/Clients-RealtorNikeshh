'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

interface ClosingCosts {
  lenderFees: {
    originationFee: number;
    applicationFee: number;
    creditReportFee: number;
    appraisalFee: number;
    underwritingFee: number;
    processingFee: number;
    total: number;
  };
  thirdPartyFees: {
    titleInsurance: number;
    titleSearch: number;
    escrowFee: number;
    attorneyFee: number;
    surveyFee: number;
    inspectionFee: number;
    total: number;
  };
  governmentFees: {
    recordingFees: number;
    transferTax: number;
    propertyTax: number;
    total: number;
  };
  prepaids: {
    homeownersInsurance: number;
    propertyTaxes: number;
    mortgageInsurance: number;
    interestPrepaid: number;
    total: number;
  };
  total: number;
}

export default function ClosingCostCalculatorPage() {
  const [purchasePrice, setPurchasePrice] = useState<string>('500000');
  const [downPayment, setDownPayment] = useState<string>('100000');
  const [interestRate, setInterestRate] = useState<string>('5.5');
  const [location, setLocation] = useState<string>('');
  const [propertyTaxRate, setPropertyTaxRate] = useState<string>('1.2');
  const [propertyType, setPropertyType] = useState<'residential' | 'commercial'>('residential');
  const [isNewConstruction, setIsNewConstruction] = useState<boolean>(false);

  const [closingCosts, setClosingCosts] = useState<ClosingCosts>({
    lenderFees: {
      originationFee: 0,
      applicationFee: 0,
      creditReportFee: 0,
      appraisalFee: 0,
      underwritingFee: 0,
      processingFee: 0,
      total: 0
    },
    thirdPartyFees: {
      titleInsurance: 0,
      titleSearch: 0,
      escrowFee: 0,
      attorneyFee: 0,
      surveyFee: 0,
      inspectionFee: 0,
      total: 0
    },
    governmentFees: {
      recordingFees: 0,
      transferTax: 0,
      propertyTax: 0,
      total: 0
    },
    prepaids: {
      homeownersInsurance: 0,
      propertyTaxes: 0,
      mortgageInsurance: 0,
      interestPrepaid: 0,
      total: 0
    },
    total: 0
  });

  useEffect(() => {
    calculateClosingCosts();
  }, [purchasePrice, downPayment, interestRate, location, propertyTaxRate, propertyType, isNewConstruction]);

  const calculateClosingCosts = () => {
    const price = parseFloat(purchasePrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const loanAmount = price - down;
    const rate = parseFloat(interestRate) || 0;
    const taxRate = parseFloat(propertyTaxRate) || 0;

    // Calculate Lender Fees
    const lenderFees = {
      originationFee: loanAmount * 0.01, // 1% of loan amount
      applicationFee: 500,
      creditReportFee: 50,
      appraisalFee: 500,
      underwritingFee: 750,
      processingFee: 400,
      total: 0
    };
    lenderFees.total = Object.values(lenderFees).reduce((a, b) => a + b, 0) - lenderFees.total;

    // Calculate Third Party Fees
    const thirdPartyFees = {
      titleInsurance: price * 0.005, // 0.5% of purchase price
      titleSearch: 400,
      escrowFee: 800,
      attorneyFee: 1000,
      surveyFee: isNewConstruction ? 0 : 500,
      inspectionFee: isNewConstruction ? 0 : 400,
      total: 0
    };
    thirdPartyFees.total = Object.values(thirdPartyFees).reduce((a, b) => a + b, 0) - thirdPartyFees.total;

    // Calculate Government Fees
    const governmentFees = {
      recordingFees: 200,
      transferTax: price * 0.01, // 1% transfer tax
      propertyTax: (price * (taxRate / 100)) / 12, // One month of property taxes
      total: 0
    };
    governmentFees.total = Object.values(governmentFees).reduce((a, b) => a + b, 0) - governmentFees.total;

    // Calculate Prepaids
    const prepaids = {
      homeownersInsurance: (price * 0.003), // Annual premium divided by 12, times 6 months
      propertyTaxes: (price * (taxRate / 100)) / 12 * 6, // 6 months of property taxes
      mortgageInsurance: down / price < 0.2 ? (loanAmount * 0.01) / 12 : 0, // Monthly PMI if down payment < 20%
      interestPrepaid: (loanAmount * (rate / 100)) / 12, // One month of prepaid interest
      total: 0
    };
    prepaids.total = Object.values(prepaids).reduce((a, b) => a + b, 0) - prepaids.total;

    // Calculate Total Closing Costs
    const total = lenderFees.total + thirdPartyFees.total + governmentFees.total + prepaids.total;

    setClosingCosts({
      lenderFees,
      thirdPartyFees,
      governmentFees,
      prepaids,
      total
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Closing Cost Calculator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
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
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {((parseFloat(downPayment) / parseFloat(purchasePrice)) * 100).toFixed(1)}% down
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  step="0.125"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Property Tax Rate (%)</label>
                <input
                  type="number"
                  value={propertyTaxRate}
                  onChange={(e) => setPropertyTaxRate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as 'residential' | 'commercial')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isNewConstruction}
                    onChange={(e) => setIsNewConstruction(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">New Construction</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estimated Closing Costs</h2>
            
            <div className="space-y-6">
              {/* Lender Fees */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Lender Fees</h3>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Origination Fee</dt>
                    <dd className="text-sm font-medium">{formatCurrency(closingCosts.lenderFees.originationFee)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Application Fee</dt>
                    <dd className="text-sm font-medium">{formatCurrency(closingCosts.lenderFees.applicationFee)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Credit Report Fee</dt>
                    <dd className="text-sm font-medium">{formatCurrency(closingCosts.lenderFees.creditReportFee)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Appraisal Fee</dt>
                    <dd className="text-sm font-medium">{formatCurrency(closingCosts.lenderFees.appraisalFee)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Underwriting Fee</dt>
                    <dd className="text-sm font-medium">{formatCurrency(closingCosts.lenderFees.underwritingFee)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Processing Fee</dt>
                    <dd className="text-sm font-medium">{formatCurrency(closingCosts.lenderFees.processingFee)}</dd>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <dt className="text-sm font-medium text-gray-900">Total Lender Fees</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(closingCosts.lenderFees.total)}</dd>
                  </div>
                </dl>
              </div>

              {/* Third Party Fees */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Third Party Fees</h3>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Title Insurance</dt>
                    <dd className="text-sm font-medium">{formatCurrency(closingCosts.thirdPartyFees.titleInsurance)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Title Search</dt>
                    <dd className="text-sm font-medium">{formatCurrency(closingCosts.thirdPartyFees.titleSearch)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Escrow Fee</dt>
                    <dd className="text-sm font-medium">{formatCurrency(closingCosts.thirdPartyFees.escrowFee)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Attorney Fee</dt>
                    <dd className="text-sm font-medium">{formatCurrency(closingCosts.thirdPartyFees.attorneyFee)}</dd>
                  </div>
                  {!isNewConstruction && (
                    <>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Survey Fee</dt>
                        <dd className="text-sm font-medium">{formatCurrency(closingCosts.thirdPartyFees.surveyFee)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Inspection Fee</dt>
                        <dd className="text-sm font-medium">{formatCurrency(closingCosts.thirdPartyFees.inspectionFee)}</dd>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between pt-2 border-t">
                    <dt className="text-sm font-medium text-gray-900">Total Third Party Fees</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(closingCosts.thirdPartyFees.total)}</dd>
                  </div>
                </dl>
              </div>

              {/* Government Fees */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Government Fees</h3>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Recording Fees</dt>
                    <dd className="text-sm font-medium">{formatCurrency(closingCosts.governmentFees.recordingFees)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Transfer Tax</dt>
                    <dd className="text-sm font-medium">{formatCurrency(closingCosts.governmentFees.transferTax)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Property Tax</dt>
                    <dd className="text-sm font-medium">{formatCurrency(closingCosts.governmentFees.propertyTax)}</dd>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <dt className="text-sm font-medium text-gray-900">Total Government Fees</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(closingCosts.governmentFees.total)}</dd>
                  </div>
                </dl>
              </div>

              {/* Prepaids */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Prepaids</h3>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Homeowners Insurance</dt>
                    <dd className="text-sm font-medium">{formatCurrency(closingCosts.prepaids.homeownersInsurance)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Property Taxes</dt>
                    <dd className="text-sm font-medium">{formatCurrency(closingCosts.prepaids.propertyTaxes)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Mortgage Insurance</dt>
                    <dd className="text-sm font-medium">{formatCurrency(closingCosts.prepaids.mortgageInsurance)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Prepaid Interest</dt>
                    <dd className="text-sm font-medium">{formatCurrency(closingCosts.prepaids.interestPrepaid)}</dd>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <dt className="text-sm font-medium text-gray-900">Total Prepaids</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(closingCosts.prepaids.total)}</dd>
                  </div>
                </dl>
              </div>

              {/* Total Closing Costs */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-blue-900">Total Closing Costs</span>
                  <span className="text-lg font-bold text-blue-900">{formatCurrency(closingCosts.total)}</span>
                </div>
                <p className="mt-1 text-sm text-blue-700">
                  {((closingCosts.total / parseFloat(purchasePrice)) * 100).toFixed(1)}% of purchase price
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 