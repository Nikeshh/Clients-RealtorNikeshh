export interface ClientRequirements {
  id: string;
  clientId: string;
  propertyType: string;
  budgetMin: number;
  budgetMax: number;
  bedrooms: number | null;
  bathrooms: number | null;
  preferredLocations: string[];
  additionalRequirements: string | null;
}

export interface Interaction {
  id: string;
  clientId: string;
  type: string;
  date: string;
  description: string;
  notes: string | null;
}

export interface SharedProperty {
  id: string;
  clientId: string;
  propertyId: string;
  status: string;
  sharedDate: string;
  property: {
    id: string;
    title: string;
    address: string;
    price: number;
    type: string;
    area: number;
  };
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  lastContact: string;
  createdAt: string;
  updatedAt: string;
  requirements: ClientRequirements;
  interactions: Interaction[];
  sharedProperties: SharedProperty[];
}

// Type for creating/editing a client
export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  status: string;
  requirements: {
    propertyType: string;
    budgetMin: number;
    budgetMax: number;
    bedrooms: number | null;
    bathrooms: number | null;
    preferredLocations: string[];
    additionalRequirements: string | null;
  };
} 