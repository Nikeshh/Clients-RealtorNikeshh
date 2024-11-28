export const clients = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
    status: 'Active',
    requirements: {
      propertyType: 'Residential',
      budgetMin: 500000,
      budgetMax: 750000,
      bedrooms: 3,
      bathrooms: 2,
      preferredLocations: ['Downtown', 'West End'],
      additionalRequirements: 'Looking for modern finishes'
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 234 567 8901',
    status: 'Active',
    requirements: {
      propertyType: 'Commercial',
      budgetMin: 1000000,
      budgetMax: 2000000,
      preferredLocations: ['Business District'],
      additionalRequirements: 'Need parking space'
    }
  }
];

export const properties = [
  {
    title: 'Modern Downtown Apartment',
    address: '123 Main St, City',
    price: 650000,
    type: 'Residential',
    bedrooms: 3,
    bathrooms: 2,
    area: 1500,
    status: 'Available',
    description: 'Beautiful modern apartment',
    features: ['Hardwood floors', 'Central AC'],
    images: [],
    source: 'Direct',
    location: 'Downtown'
  },
  {
    title: 'Commercial Office Space',
    address: '456 Business Ave',
    price: 1200000,
    type: 'Commercial',
    area: 2500,
    status: 'Available',
    description: 'Prime location office space',
    features: ['Open floor plan', 'Parking'],
    images: [],
    source: 'Broker',
    location: 'Business District'
  }
]; 