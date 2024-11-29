import { Property as PrismaProperty } from '@prisma/client';

// Base property type with all fields
export interface PropertyBase {
  title: string;
  address: string;
  price: number;
  type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number;
  status: string;
  description: string | null;
  features: string[];
  images: string[];
  source: string;
  location: string;
}

// Type for creating/importing properties
export type ImportedProperty = Omit<PropertyBase, 'id' | 'createdAt' | 'updatedAt'>;

// Full property type including all fields
export type Property = PropertyBase & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  link?: string;
}; 