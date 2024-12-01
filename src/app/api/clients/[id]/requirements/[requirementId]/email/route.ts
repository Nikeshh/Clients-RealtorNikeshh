import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';
import PropertyEmail from '@/emails/PropertyEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];
    const requirementId = request.url.split('/requirements/')[1].split('/')[0];
    const { subject, message, properties } = await request.json();

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

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Real Estate CRM <properties@yourdomain.com>',
      to: client.email,
      subject: subject,
      react: PropertyEmail({
        clientName: client.name,
        message: message,
        properties: properties.map((property: any) => ({
          title: property.title,
          address: property.address,
          price: property.price,
          imageUrl: property.images?.[0],
          link: property.link,
        })),
      }),
    });

    if (error) {
      throw new Error('Failed to send email');
    }

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId,
        type: 'EMAIL_SENT',
        description: `Email sent: ${subject}`,
        requirementId,
      },
    });

    // Add to email queue for tracking
    await prisma.emailQueue.create({
      data: {
        to: client.email,
        subject,
        content: message,
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}); 