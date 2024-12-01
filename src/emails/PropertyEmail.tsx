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
import { Tailwind } from '@react-email/tailwind';

interface Property {
  title: string;
  address: string;
  price: number;
  images?: string[];
  description?: string;
  link?: string;
}

interface PropertyEmailProps {
  clientName: string;
  message: string;
  properties: Property[];
}

export default function PropertyEmail({
  clientName,
  message,
  properties,
}: PropertyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Property suggestions for your review</Preview>
      <Tailwind>
        <Body className="bg-gray-100 my-auto mx-auto font-sans">
          <Container className="bg-white border border-gray-200 rounded my-8 mx-auto p-8 max-w-xl">
            <Heading className="text-2xl font-bold text-gray-900 mb-4">
              Hello {clientName},
            </Heading>

            <Text className="text-gray-700 mb-6">
              {message}
            </Text>

            {properties.map((property, index) => (
              <Section key={index} className="border-t border-gray-200 pt-6 mb-6">
                {property.images?.[0] && (
                  <Img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <Heading className="text-xl font-bold text-gray-900 mb-2">
                  {property.title}
                </Heading>
                <Text className="text-gray-600 mb-2">{property.address}</Text>
                <Text className="text-lg font-bold text-gray-900 mb-2">
                  ${property.price.toLocaleString()}
                </Text>
                {property.description && (
                  <Text className="text-gray-700 mb-4">{property.description}</Text>
                )}
                {property.link && (
                  <Link
                    href={property.link}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Property Details →
                  </Link>
                )}
              </Section>
            ))}

            <Text className="text-gray-700 mt-8">
              Please let me know if you would like to schedule viewings for any of these properties.
            </Text>

            <Text className="text-gray-700">
              Best regards,
              <br />
              Your Real Estate Agent
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
} 