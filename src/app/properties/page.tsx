'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { formatCurrency } from '@/lib/utils';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
  listingType: 'SALE' | 'RENTAL';
  bedrooms?: number | null;
  bathrooms?: number | null;
  area: number;
  status: string;
  description?: string;
  features: string[];
  images: string[];
  source: string;
  location: string;
  yearBuilt?: number | null;
  
  // Rental specific fields
  furnished?: boolean | null;
  petsAllowed?: boolean | null;
  leaseTerm?: string | null;
  
  // Purchase specific fields
  lotSize?: number | null;
  basement?: boolean | null;
  garage?: boolean | null;
  parkingSpaces?: number | null;
  propertyStyle?: string | null;
  createdAt: string;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterListingType, setFilterListingType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    bedroomsMin: '',
    bathroomsMin: '',
    areaMin: '',
    areaMax: '',
    location: '',
    yearBuilt: '',
    furnished: false,
    petsAllowed: false,
    hasBasement: false,
    hasGarage: false,
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading('loadProperties', true);
    try {
      const response = await fetch('/api/properties');
      if (!response.ok) throw new Error('Failed to fetch properties');
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load properties', 'error');
    } finally {
      setLoading('loadProperties', false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      filterType === 'all' || 
      property.type.toLowerCase() === filterType.toLowerCase();

    const matchesListingType =
      filterListingType === 'all' ||
      property.listingType === filterListingType;

    const matchesStatus =
      filterStatus === 'all' ||
      property.status === filterStatus;

    const matchesPrice = 
      (!filters.priceMin || property.price >= parseFloat(filters.priceMin)) &&
      (!filters.priceMax || property.price <= parseFloat(filters.priceMax));

    const matchesBedrooms =
      !filters.bedroomsMin || (property.bedrooms || 0) >= parseInt(filters.bedroomsMin);

    const matchesBathrooms =
      !filters.bathroomsMin || (property.bathrooms || 0) >= parseInt(filters.bathroomsMin);

    const matchesArea =
      (!filters.areaMin || property.area >= parseFloat(filters.areaMin)) &&
      (!filters.areaMax || property.area <= parseFloat(filters.areaMax));

    const matchesLocation =
      !filters.location ||
      property.location.toLowerCase().includes(filters.location.toLowerCase());

    const matchesYearBuilt =
      !filters.yearBuilt ||
      (property.yearBuilt && property.yearBuilt >= parseInt(filters.yearBuilt));

    const matchesAmenities =
      (!filters.furnished || property.furnished === filters.furnished) &&
      (!filters.petsAllowed || property.petsAllowed === filters.petsAllowed) &&
      (!filters.hasBasement || property.basement === filters.hasBasement) &&
      (!filters.hasGarage || property.garage === filters.hasGarage);

    return (
      matchesSearch &&
      matchesType &&
      matchesListingType &&
      matchesStatus &&
      matchesPrice &&
      matchesBedrooms &&
      matchesBathrooms &&
      matchesArea &&
      matchesLocation &&
      matchesYearBuilt &&
      matchesAmenities
    );
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'area-asc':
        return a.area - b.area;
      case 'area-desc':
        return b.area - a.area;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default:
        return 0;
    }
  });

  if (isLoading('loadProperties')) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-blue-900 sm:truncate sm:text-3xl">
            Properties
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link href="/properties/new">
            <Button variant="primary">Add New Property</Button>
          </Link>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search properties..."
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="land">Land</option>
            </select>
          </div>

          <div>
            <select
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5"
              value={filterListingType}
              onChange={(e) => setFilterListingType(e.target.value)}
            >
              <option value="all">All Listings</option>
              <option value="SALE">For Sale</option>
              <option value="RENTAL">For Rent</option>
            </select>
          </div>

          <div>
            <select
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="Under Contract">Under Contract</option>
              <option value="Sold">Sold</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="mt-4">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <span>{showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters</span>
            <svg
              className={`ml-2 h-5 w-5 transform transition-transform ${
                showAdvancedFilters ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2"
                    value={filters.priceMin}
                    onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2"
                    value={filters.priceMax}
                    onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms & Bathrooms</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min Beds"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2"
                    value={filters.bedroomsMin}
                    onChange={(e) => setFilters({ ...filters, bedroomsMin: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Min Baths"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2"
                    value={filters.bathroomsMin}
                    onChange={(e) => setFilters({ ...filters, bathroomsMin: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area (sqft)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2"
                    value={filters.areaMin}
                    onChange={(e) => setFilters({ ...filters, areaMin: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2"
                    value={filters.areaMax}
                    onChange={(e) => setFilters({ ...filters, areaMax: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                <input
                  type="number"
                  placeholder="Minimum year"
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2"
                  value={filters.yearBuilt}
                  onChange={(e) => setFilters({ ...filters, yearBuilt: e.target.value })}
                />
              </div>
            </div>

            {/* Amenities Checkboxes */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.furnished}
                  onChange={(e) => setFilters({ ...filters, furnished: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Furnished</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.petsAllowed}
                  onChange={(e) => setFilters({ ...filters, petsAllowed: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Pets Allowed</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.hasBasement}
                  onChange={(e) => setFilters({ ...filters, hasBasement: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Basement</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.hasGarage}
                  onChange={(e) => setFilters({ ...filters, hasGarage: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Garage</span>
              </label>
            </div>
          </div>
        )}

        {/* View Mode Toggle and Sort */}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <select
              className="rounded-lg border border-gray-300 px-4 py-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="area-asc">Area: Small to Large</option>
              <option value="area-desc">Area: Large to Small</option>
            </select>
            <div className="text-sm text-gray-500">
              {sortedProperties.length} properties found
            </div>
          </div>
        </div>
      </div>

      {/* Properties Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProperties.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="block bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {property.images[0] && (
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="object-cover w-full h-48"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
                    <p className="text-sm text-gray-500">{property.address}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {property.status}
                  </span>
                </div>
                <p className="mt-2 text-lg font-bold text-blue-600">
                  {formatCurrency(property.price)}
                  {property.listingType === 'RENTAL' && <span className="text-sm font-normal">/month</span>}
                </p>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  {property.bedrooms && <span>{property.bedrooms} beds</span>}
                  {property.bathrooms && <span>{property.bathrooms} baths</span>}
                  <span>{property.area} sqft</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedProperties.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="block bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex">
                {property.images[0] && (
                  <div className="flex-shrink-0 w-48">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
                      <p className="text-sm text-gray-500">{property.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(property.price)}
                        {property.listingType === 'RENTAL' && <span className="text-sm font-normal">/month</span>}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {property.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    {property.bedrooms && <span>{property.bedrooms} beds</span>}
                    {property.bathrooms && <span>{property.bathrooms} baths</span>}
                    <span>{property.area} sqft</span>
                  </div>
                  {property.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{property.description}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {sortedProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No properties found matching your criteria.</p>
        </div>
      )}
    </div>
  );
} 