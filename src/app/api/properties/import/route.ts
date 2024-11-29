import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';
import PropertyScraper from '@/services/propertyScrapers';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Scrape property data
    const scrapedData = await PropertyScraper.scrapeProperty(url);

    // Create property in database
    const property = await prisma.property.create({
      data: {
        ...scrapedData,
        source: url,
        status: 'Available',
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      property,
    });
  } catch (error) {
    console.error('Error importing property:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to import property',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}); 