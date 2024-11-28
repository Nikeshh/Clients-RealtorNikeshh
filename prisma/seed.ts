import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.gatheredProperty.deleteMany({});
  await prisma.sharedProperty.deleteMany({});
  await prisma.interaction.deleteMany({});
  await prisma.rentalPreferences.deleteMany({});
  await prisma.purchasePreferences.deleteMany({});
  await prisma.clientRequirement.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.client.deleteMany({});

  // Create sample properties
  const property1 = await prisma.property.create({
    data: {
      title: 'Modern Downtown Apartment',
      address: '123 Main St',
      price: 2500,
      type: 'Apartment',
      listingType: 'RENTAL',
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      status: 'Available',
      description: 'Beautiful modern apartment in downtown area',
      features: ['Hardwood floors', 'Stainless steel appliances', 'Central AC'],
      images: ['https://example.com/image1.jpg'],
      source: 'Direct',
      location: 'Downtown',
      furnished: true,
      petsAllowed: true,
      leaseTerm: 'Long-term',
    },
  });

  const property2 = await prisma.property.create({
    data: {
      title: 'Suburban Family Home',
      address: '456 Oak Ave',
      price: 450000,
      type: 'House',
      listingType: 'SALE',
      bedrooms: 4,
      bathrooms: 3,
      area: 2500,
      status: 'Available',
      description: 'Spacious family home in quiet neighborhood',
      features: ['Large backyard', 'Updated kitchen', 'Two-car garage'],
      images: ['https://example.com/image2.jpg'],
      source: 'MLS',
      location: 'Suburbs',
      yearBuilt: 2015,
      lotSize: 5000,
      basement: true,
      garage: true,
      parkingSpaces: 2,
      propertyStyle: 'Traditional',
    },
  });

  // Create sample clients with requirements
  const client1 = await prisma.client.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      status: 'Active',
      requirements: {
        create: {
          name: 'Rental Search',
          type: 'RENTAL',
          propertyType: 'Apartment',
          budgetMin: 2000,
          budgetMax: 3000,
          bedrooms: 2,
          bathrooms: 2,
          preferredLocations: ['Downtown', 'Midtown'],
          additionalRequirements: 'Must have parking',
          status: 'Active',
          rentalPreferences: {
            create: {
              leaseTerm: 'Long-term',
              furnished: true,
              petsAllowed: true,
              maxRentalBudget: 3000,
              preferredMoveInDate: new Date('2024-03-01'),
            },
          },
        },
      },
      interactions: {
        create: {
          type: 'Initial Contact',
          description: 'First meeting to discuss requirements',
          date: new Date(),
        },
      },
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '987-654-3210',
      status: 'Active',
      requirements: {
        create: {
          name: 'Home Purchase',
          type: 'PURCHASE',
          propertyType: 'House',
          budgetMin: 400000,
          budgetMax: 500000,
          bedrooms: 4,
          bathrooms: 3,
          preferredLocations: ['Suburbs', 'North End'],
          additionalRequirements: 'Prefer newer construction',
          status: 'Active',
          purchasePreferences: {
            create: {
              propertyAge: '0-5',
              preferredStyle: 'Traditional',
              parking: 2,
              lotSize: 5000,
              basement: true,
              garage: true,
            },
          },
        },
      },
      interactions: {
        create: {
          type: 'Property Viewing',
          description: 'Viewed 456 Oak Ave',
          date: new Date(),
        },
      },
    },
  });

  // Create shared properties
  await prisma.sharedProperty.create({
    data: {
      clientId: client1.id,
      propertyId: property1.id,
      status: 'Shared',
    },
  });

  await prisma.sharedProperty.create({
    data: {
      clientId: client2.id,
      propertyId: property2.id,
      status: 'Shared',
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 