import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface Property {
  title: string;
  address: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  images: string[];
  description?: string;
}

interface PropertyEmailProps {
  clientName: string;
  properties: Property[];
}

export default function PropertyEmail({ clientName, properties }: PropertyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Check out these properties selected for you</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Hello {clientName},</Heading>
          <Text style={text}>
            Here are some properties that match your requirements:
          </Text>

          {properties.map((property, index) => (
            <Section key={index} style={propertySection}>
              {property.images[0] && (
                <Img
                  src={property.images[0]}
                  alt={property.title}
                  width={600}
                  height={400}
                  style={image}
                />
              )}
              <Heading style={h2}>{property.title}</Heading>
              <Text style={text}>{property.address}</Text>
              <Text style={price}>
                ${property.price.toLocaleString()}
              </Text>
              <Text style={details}>
                {property.bedrooms && `${property.bedrooms} beds • `}
                {property.bathrooms && `${property.bathrooms} baths • `}
                {property.area} sqft
              </Text>
              {property.description && (
                <Text style={text}>{property.description}</Text>
              )}
            </Section>
          ))}

          <Text style={footer}>
            Best regards,<br />
            Your Real Estate Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '16px 0',
};

const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '12px 0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const propertySection = {
  borderTop: '1px solid #e6ebf1',
  margin: '32px 0',
  padding: '32px 0',
};

const image = {
  borderRadius: '8px',
  marginBottom: '16px',
};

const price = {
  color: '#0070f3',
  fontSize: '20px',
  fontWeight: '600',
  margin: '8px 0',
};

const details = {
  color: '#666',
  fontSize: '14px',
  margin: '8px 0',
};

const footer = {
  color: '#666',
  fontSize: '14px',
  fontStyle: 'italic',
  marginTop: '32px',
}; 