'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

interface CommissionTier {
  from: number;
  to: number | null;
  rate: number;
}

interface CommissionSplit {
  agentPercentage: number;
  brokeragePercentage: number;
}

export default function CommissionCalculatorPage() {
  const [propertyPrice, setPropertyPrice] = useState<string>('500000');
  const [commissionType, setCommissionType] = useState<'standard' | 'tiered' | 'custom'>('standard');
  const [standardRate, setStandardRate] = useState<string>('2.5');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [tiers, setTiers] = useState<CommissionTier[]>([
    { from: 0, to: 500000, rate: 2.5 },
    { from: 500000, to: 1000000, rate: 2 },
    { from: 1000000, to: null, rate: 1.5 }
  ]);
  const [splits, setSplits] = useState<CommissionSplit>({
    agentPercentage: 70,
    brokeragePercentage: 30
  });
  const [showSplits, setShowSplits] = useState(false);

  const [results, setResults] = useState({
    totalCommission: 0,
    effectiveRate: 0,
    agentShare: 0,
    brokerageShare: 0,
    breakdown: [] as { tier: CommissionTier; amount: number }[]
  });

  useEffect(() => {
    calculateCommission();
  }, [propertyPrice, commissionType, standardRate, customAmount, tiers, splits]);

  const calculateCommission = () => {
    const price = parseFloat(propertyPrice) || 0;
    let totalCommission = 0;
    let breakdown: { tier: CommissionTier; amount: number }[] = [];

    if (commissionType === 'standard') {
      totalCommission = price * (parseFloat(standardRate) / 100);
    } else if (commissionType === 'custom') {
      totalCommission = parseFloat(customAmount) || 0;
    } else if (commissionType === 'tiered') {
      let remainingPrice = price;
      
      for (const tier of tiers) {
        if (remainingPrice <= 0) break;
        
        const tierRange = tier.to ? tier.to - tier.from : remainingPrice;
        const amountInTier = Math.min(remainingPrice, tierRange);
        const tierCommission = amountInTier * (tier.rate / 100);
        
        totalCommission += tierCommission;
        breakdown.push({ tier, amount: tierCommission });
        remainingPrice -= amountInTier;
      }
    }

    const effectiveRate = (totalCommission / price) * 100;
    const agentShare = totalCommission * (splits.agentPercentage / 100);
    const brokerageShare = totalCommission * (splits.brokeragePercentage / 100);

    setResults({
      totalCommission,
      effectiveRate,
      agentShare,
      brokerageShare,
      breakdown
    });
  };

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1];
    setTiers([
      ...tiers,
      {
        from: lastTier.to || lastTier.from,
        to: null,
        rate: lastTier.rate
      }
    ]);
  };

  const removeTier = (index: number) => {
    if (tiers.length > 1) {
      const newTiers = [...tiers];
      newTiers.splice(index, 1);
      setTiers(newTiers);
    }
  };

  const updateTier = (index: number, field: keyof CommissionTier, value: string) => {
    const newTiers = [...tiers];
    const numValue = parseFloat(value);
    
    if (field === 'rate') {
      newTiers[index].rate = numValue || 0;
    } else if (field === 'from') {
      newTiers[index].from = numValue || 0;
    } else if (field === 'to') {
      newTiers[index].to = value === '' ? null : numValue || 0;
    }
    
    setTiers(newTiers);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Commission Calculator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Property Price</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(e.target.value)}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Commission Type</label>
                <select
                  value={commissionType}
                  onChange={(e) => setCommissionType(e.target.value as 'standard' | 'tiered' | 'custom')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="standard">Standard Rate</option>
                  <option value="tiered">Tiered Rate</option>
                  <option value="custom">Custom Amount</option>
                </select>
              </div>

              {commissionType === 'standard' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Commission Rate (%)</label>
                  <input
                    type="number"
                    value={standardRate}
                    onChange={(e) => setStandardRate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    step="0.1"
                  />
                </div>
              )}

              {commissionType === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Custom Amount</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}

              {commissionType === 'tiered' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700">Commission Tiers</h3>
                    <button
                      onClick={addTier}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Add Tier
                    </button>
                  </div>
                  
                  {tiers.map((tier, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500">From</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            value={tier.from}
                            onChange={(e) => updateTier(index, 'from', e.target.value)}
                            className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500">To</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            value={tier.to || ''}
                            onChange={(e) => updateTier(index, 'to', e.target.value)}
                            className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="No limit"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Rate (%)</label>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="number"
                            value={tier.rate}
                            onChange={(e) => updateTier(index, 'rate', e.target.value)}
                            className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            step="0.1"
                          />
                          {tiers.length > 1 && (
                            <button
                              onClick={() => removeTier(index)}
                              className="text-red-600 hover:text-red-500"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showSplits}
                    onChange={(e) => setShowSplits(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show commission splits</span>
                </label>
              </div>

              {showSplits && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Agent Split (%)</label>
                    <input
                      type="number"
                      value={splits.agentPercentage}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setSplits({
                          agentPercentage: value,
                          brokeragePercentage: 100 - value
                        });
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      max="100"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Brokerage Split (%)</label>
                    <input
                      type="number"
                      value={splits.brokeragePercentage}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setSplits({
                          agentPercentage: 100 - value,
                          brokeragePercentage: value
                        });
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      max="100"
                      min="0"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Commission Summary</h2>
            
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Property Price</dt>
                <dd className="text-2xl font-bold text-gray-900">{formatCurrency(parseFloat(propertyPrice) || 0)}</dd>
              </div>
              
              <div className="pt-4 border-t">
                <dt className="text-sm text-gray-500">Total Commission</dt>
                <dd className="text-2xl font-bold text-blue-600">{formatCurrency(results.totalCommission)}</dd>
                <dd className="text-sm text-gray-500">
                  Effective Rate: {results.effectiveRate.toFixed(2)}%
                </dd>
              </div>

              {showSplits && (
                <div className="pt-4 border-t space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">Agent Share ({splits.agentPercentage}%)</dt>
                    <dd className="text-lg font-semibold text-gray-900">{formatCurrency(results.agentShare)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Brokerage Share ({splits.brokeragePercentage}%)</dt>
                    <dd className="text-lg font-semibold text-gray-900">{formatCurrency(results.brokerageShare)}</dd>
                  </div>
                </div>
              )}

              {commissionType === 'tiered' && results.breakdown.length > 0 && (
                <div className="pt-4 border-t">
                  <dt className="text-sm text-gray-500 mb-2">Tier Breakdown</dt>
                  {results.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {formatCurrency(item.tier.from)} - {item.tier.to ? formatCurrency(item.tier.to) : '∞'} 
                        ({item.tier.rate}%)
                      </span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
} 