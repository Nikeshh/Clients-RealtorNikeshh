import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';
import PropertyScraper from '@/services/propertyScrapers';
import * as XLSX from 'xlsx';
import pdfParse from 'pdf-parse';

interface ExcelProperty {
  title: string;
  address: string;
  price: string;
  type: string;
  listingType: 'SALE' | 'RENTAL';
  bedrooms?: string;
  bathrooms?: string;
  area: string;
  status?: string;
  description?: string;
  features?: string;
  images?: string;
  location: string;
  yearBuilt?: string;
  source?: string;
}

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const importType = formData.get('importType') as string;

    if (importType === 'url') {
      const url = formData.get('url') as string;
      if (!url) {
        return NextResponse.json(
          { error: 'URL is required' },
          { status: 400 }
        );
      }

      // Scrape property data from URL
      const scrapedData = await PropertyScraper.scrapeProperty(url);
      const property = await prisma.property.create({
        data: {
          ...scrapedData,
          source: url,
          status: 'Available',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        property,
      });
    } else if (importType === 'excel') {
      const file = formData.get('file') as Blob;
      if (!file) {
        return NextResponse.json(
          { error: 'File is required' },
          { status: 400 }
        );
      }

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<ExcelProperty>(worksheet);

      // Process Excel data
      const properties = await Promise.all(
        data.map(async (row) => {
          return prisma.property.create({
            data: {
              title: row.title || '',
              address: row.address || '',
              price: parseFloat(row.price) || 0,
              type: row.type || 'House',
              listingType: row.listingType || 'SALE',
              bedrooms: row.bedrooms ? parseInt(row.bedrooms) : null,
              bathrooms: row.bathrooms ? parseInt(row.bathrooms) : null,
              area: parseFloat(row.area) || 0,
              status: row.status || 'Available',
              description: row.description || '',
              features: row.features ? row.features.split(',').map(f => f.trim()) : [],
              images: row.images ? row.images.split(',').map(i => i.trim()) : [],
              source: row.source || 'Excel Import',
              location: row.location || '',
              yearBuilt: row.yearBuilt ? parseInt(row.yearBuilt) : null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        })
      );

      return NextResponse.json({
        success: true,
        imported: properties.length,
        properties,
      });
    } else if (importType === 'pdf') {
      const file = formData.get('file') as Blob;
      if (!file) {
        return NextResponse.json(
          { error: 'File is required' },
          { status: 400 }
        );
      }

      const buffer = await file.arrayBuffer();
      const pdfData = await pdfParse(Buffer.from(buffer));
      const lines = pdfData.text.split('\n').filter((line: string) => line.trim());

      // Process PDF data
      const properties = [];
      let currentProperty: Record<string, any> = {};

      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('property:') || lowerLine.includes('title:')) {
          if (Object.keys(currentProperty).length > 0) {
            properties.push(currentProperty);
          }
          currentProperty = { 
            title: line.split(':')[1]?.trim() || 'Imported Property',
            status: 'Available',
            type: 'House',
            listingType: 'SALE',
            features: [],
            images: [],
            source: 'PDF Import'
          };
        } else if (lowerLine.includes('address:')) {
          currentProperty.address = line.split(':')[1]?.trim() || '';
        } else if (lowerLine.includes('price:')) {
          const priceText = line.split(':')[1]?.trim() || '0';
          currentProperty.price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
        } else if (lowerLine.includes('location:')) {
          currentProperty.location = line.split(':')[1]?.trim() || '';
        } else if (lowerLine.includes('area:') || lowerLine.includes('size:')) {
          const areaText = line.split(':')[1]?.trim() || '0';
          currentProperty.area = parseFloat(areaText.replace(/[^0-9.]/g, '')) || 0;
        } else if (lowerLine.includes('bedroom')) {
          const match = line.match(/\d+/);
          if (match) {
            currentProperty.bedrooms = parseInt(match[0]);
          }
        } else if (lowerLine.includes('bathroom')) {
          const match = line.match(/\d+/);
          if (match) {
            currentProperty.bathrooms = parseInt(match[0]);
          }
        } else if (lowerLine.includes('description:')) {
          currentProperty.description = line.split(':')[1]?.trim() || '';
        }
      }

      if (Object.keys(currentProperty).length > 0) {
        properties.push(currentProperty);
      }

      // Save properties to database
      const savedProperties = await Promise.all(
        properties.map(async (prop) => {
          return prisma.property.create({
            data: {
              title: prop.title,
              address: prop.address,
              price: prop.price,
              type: prop.type,
              listingType: prop.listingType,
              status: prop.status,
              location: prop.location,
              area: prop.area,
              bedrooms: prop.bedrooms,
              bathrooms: prop.bathrooms,
              description: prop.description,
              features: prop.features,
              images: prop.images,
              source: prop.source,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        })
      );

      return NextResponse.json({
        success: true,
        imported: savedProperties.length,
        properties: savedProperties,
      });
    }

    return NextResponse.json(
      { error: 'Invalid import type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error importing properties:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to import properties',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}); 