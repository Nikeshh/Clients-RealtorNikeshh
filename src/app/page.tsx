import Link from 'next/link';

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="bg-white overflow-hidden shadow-md rounded-xl border border-blue-100">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-blue-900">Quick Actions</h3>
            <div className="mt-4 space-y-2">
              <Link href="/clients/new" className="block px-4 py-3 text-sm text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                ➕ Add New Client
              </Link>
              <Link href="/properties/import" className="block px-4 py-3 text-sm text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                📥 Import Properties
              </Link>
              <Link href="/tools/calculator" className="block px-4 py-3 text-sm text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                🧮 Mortgage Calculator
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Clients */}
        <div className="bg-white overflow-hidden shadow-md rounded-xl border border-blue-100">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-blue-900">Recent Clients</h3>
            <div className="mt-4 space-y-2">
              {['John Doe', 'Jane Smith', 'Mike Johnson'].map((client) => (
                <div key={client} className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg transition-colors">
                  <span className="text-gray-700">👤 {client}</span>
                  <span className="text-sm text-blue-600 font-medium">View Details →</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Properties */}
        <div className="bg-white overflow-hidden shadow-md rounded-xl border border-blue-100">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-blue-900">Recent Properties</h3>
            <div className="mt-4 space-y-2">
              {[
                '123 Main St, City',
                '456 Park Ave, Town',
                '789 Oak Rd, Village'
              ].map((property) => (
                <div key={property} className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg transition-colors">
                  <span className="text-gray-700">🏠 {property}</span>
                  <span className="text-sm text-blue-600 font-medium">View Details →</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
