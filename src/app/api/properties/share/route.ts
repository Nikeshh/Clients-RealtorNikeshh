import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const { clientId, propertyId, message, emailData } = await request.json();

    // Validate required fields
    if (!clientId || !propertyId || !emailData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the client's email
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { email: true, name: true },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Get the property details
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        sharedWith: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Create all database records first
    const [sharedProperty, interaction, emailQueue] = await prisma.$transaction([
      // Create a SharedProperty record
      prisma.sharedProperty.create({
        data: {
          propertyId,
          status: 'SHARED',
        },
      }),

      // Create an interaction record
      prisma.interaction.create({
        data: {
          clientId,
          type: 'PROPERTY_SHARED',
          description: `Shared property: ${property.title}`,
        },
      }),

      // Add to email queue for tracking
      prisma.emailQueue.create({
        data: {
          to: client.email,
          subject: emailData.subject,
          content: emailData.message || message,
          status: 'PENDING',
          createdAt: new Date(),
        },
      }),
    ]);

    try {
      // Send email using our email service
      const emailResponse = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: client.email,
          subject: emailData.subject,
          template: 'PropertyEmail',
          data: {
            clientName: client.name,
            message: emailData.message || message || 'I thought you might be interested in this property.',
            properties: [
              {
                title: property.title,
                address: property.address,
                price: property.price,
                imageUrl: property.images?.[0],
                link: property.link ?? "",
              },
            ],
          },
        }),
      });

      if (!emailResponse.ok) {
        throw new Error('Failed to send email');
      }

      const emailResult = await emailResponse.json();

      // Update email queue status
      await prisma.emailQueue.update({
        where: { id: emailQueue.id },
        data: { 
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      // Update client's lastContact
      await prisma.client.update({
        where: { id: clientId },
        data: { lastContact: new Date() },
      });

      return NextResponse.json({
        success: true,
        sharedProperty,
        interaction,
        emailQueue,
        emailId: emailResult.id,
      });

    } catch (emailError) {
      // Update email queue status on failure
      await prisma.emailQueue.update({
        where: { id: emailQueue.id },
        data: { status: 'FAILED' },
      });

      console.error('Email sending error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const clientId = searchParams.get('clientId');

    const sharedProperties = await prisma.sharedProperty.findMany({
      where: {
        propertyId: propertyId || undefined,
      },
      include: {
        property: true,
      },
      orderBy: {
        sharedDate: 'desc',
      },
    });

    return NextResponse.json(sharedProperties);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared properties' },
      { status: 500 }
    );
  }
}); 