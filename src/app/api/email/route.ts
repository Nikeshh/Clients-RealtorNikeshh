import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import nodemailer from 'nodemailer';
import { renderAsync } from '@react-email/render';
import PropertyEmail from '@/emails/PropertyEmail';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Boolean(process.env.SMTP_SECURE), // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const { to, subject, template, data } = await request.json();

    // Validate required fields
    if (!to || !subject || !template) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let emailComponent;
    switch (template) {
      case 'PropertyEmail':
        emailComponent = PropertyEmail({
          clientName: data.clientName,
          message: data.message,
          properties: data.properties,
        });
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid template' },
          { status: 400 }
        );
    }

    // Render React component to HTML
    const html = await renderAsync(emailComponent);

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Real Estate CRM" <noreply@yourdomain.com>',
      to,
      subject,
      html,
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // You can implement message tracking here if needed
    return NextResponse.json({
      success: true,
      status: 'delivered',
    });

  } catch (error) {
    console.error('Error fetching email:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email status' },
      { status: 500 }
    );
  }
});
