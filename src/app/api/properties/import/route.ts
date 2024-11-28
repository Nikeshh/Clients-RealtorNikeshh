import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { ImportedProperty } from '@/types/property';

// POST /api/properties/import - Import properties from URL or file
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const importMethod = formData.get('importMethod') as 'url' | 'file';
    const skipDuplicates = formData.get('skipDuplicates') === 'true';

    let properties: ImportedProperty[] = [];

    if (importMethod === 'url') {
      const url = formData.get('url') as string;
      if (!url) {
        return NextResponse.json(
          { error: 'URL is required' },
          { status: 400 }
        );
      }
      properties = await scrapePropertiesFromUrl(url);
    } else {
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json(
          { error: 'File is required' },
          { status: 400 }
        );
      }
      properties = await parsePropertiesFromFile(file);
    }

    // Process and save properties
    const savedProperties = await Promise.all(
      properties.map(async (property) => {
        if (skipDuplicates) {
          // Check for duplicates based on title and address
          const existing = await prisma.property.findFirst({
            where: {
              title: property.title,
              address: property.address
            }
          });
          if (existing) return existing;
        }

        return await prisma.property.create({
          data: property
        });
      })
    );

    return NextResponse.json({
      success: true,
      imported: savedProperties.length,
      properties: savedProperties
    });
  } catch (error) {
    console.error('Error importing properties:', error);
    return NextResponse.json(
      { error: 'Error importing properties' },
      { status: 500 }
    );
  }
}

// Function to scrape properties from URL
async function scrapePropertiesFromUrl(url: string): Promise<ImportedProperty[]> {
  // TODO: Implement actual web scraping logic
  // For now, return mock data
  return [
    {
      title: 'Scraped Property',
      address: '123 Web St',
      type: 'Residential',
      area: 1500,
      price: 500000,
      bedrooms: 3,
      bathrooms: 2,
      source: 'Web Scrape',
      location: 'Downtown',
      status: 'Available',
      description: 'Property scraped from web',
      features: ['Hardwood floors', 'Central AC'],
      images: []
    }
  ];
}

// Function to parse properties from uploaded file
async function parsePropertiesFromFile(file: File): Promise<ImportedProperty[]> {
  // TODO: Implement actual file parsing logic
  // For now, return mock data
  return [
    {
      title: 'Imported Property',
      address: '456 Sheet Ave',
      type: 'Commercial',
      area: 2500,
      price: 750000,
      bedrooms: null,
      bathrooms: null,
      source: 'File Import',
      location: 'Business District',
      status: 'Available',
      description: 'Property imported from sheet',
      features: ['Open floor plan', 'Parking included'],
      images: []
    }
  ];
} 