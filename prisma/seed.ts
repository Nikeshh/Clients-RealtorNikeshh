import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.sharedProperty.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.clientRequirements.deleteMany();
  await prisma.client.deleteMany();
  await prisma.property.deleteMany();

  // Create clients with their requirements
  const client1 = await prisma.client.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 234 567 8900',
      status: 'Active',
      requirements: {
        create: {
          propertyType: 'Residential',
          budgetMin: 500000,
          budgetMax: 750000,
          bedrooms: 3,
          bathrooms: 2,
          preferredLocations: ['Downtown', 'West End'],
          additionalRequirements: 'Looking for modern finishes, preferably with a balcony'
        }
      }
    }
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1 234 567 8901',
      status: 'Active',
      requirements: {
        create: {
          propertyType: 'Commercial',
          budgetMin: 1000000,
          budgetMax: 2000000,
          preferredLocations: ['Business District'],
          additionalRequirements: 'Need parking space and meeting rooms'
        }
      }
    }
  });

  // Create properties
  const property1 = await prisma.property.create({
    data: {
      title: 'Modern Downtown Apartment',
      address: '123 Main St, City',
      price: 650000,
      type: 'Residential',
      bedrooms: 3,
      bathrooms: 2,
      area: 1500,
      status: 'Available',
      description: 'Beautiful modern apartment with city views',
      features: [
        'Hardwood floors',
        'Stainless steel appliances',
        'In-unit laundry',
        'Central air',
        'Balcony'
      ],
      images: ['/placeholder1.jpg', '/placeholder2.jpg'],
      source: 'Direct Import',
      location: 'Downtown'
    }
  });

  const property2 = await prisma.property.create({
    data: {
      title: 'Commercial Office Space',
      address: '456 Business Ave, City',
      price: 1200000,
      type: 'Commercial',
      area: 2500,
      status: 'Available',
      description: 'Prime location office space',
      features: [
        'Open floor plan',
        'Meeting rooms',
        'Kitchen area',
        'Security system',
        'Parking included'
      ],
      images: ['/placeholder3.jpg', '/placeholder4.jpg'],
      source: 'Broker Sheet',
      location: 'Business District'
    }
  });

  // Create interactions
  await prisma.interaction.createMany({
    data: [
      {
        clientId: client1.id,
        type: 'Email',
        description: 'Sent property recommendations',
        notes: 'Client expressed interest in downtown properties',
        date: new Date('2024-03-20')
      },
      {
        clientId: client1.id,
        type: 'Call',
        description: 'Initial consultation',
        notes: 'Discussed budget and requirements',
        date: new Date('2024-03-15')
      },
      {
        clientId: client2.id,
        type: 'Meeting',
        description: 'Property viewing',
        notes: 'Showed commercial space',
        date: new Date('2024-03-18')
      }
    ]
  });

  // Share properties with clients
  await prisma.sharedProperty.createMany({
    data: [
      {
        clientId: client1.id,
        propertyId: property1.id,
        status: 'Interested',
        sharedDate: new Date('2024-03-18')
      },
      {
        clientId: client2.id,
        propertyId: property2.id,
        status: 'Shared',
        sharedDate: new Date('2024-03-19')
      }
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 