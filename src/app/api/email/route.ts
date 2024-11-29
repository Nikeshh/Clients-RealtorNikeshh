import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import PropertyEmail from '@/emails/PropertyEmail';

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const { clientEmail, clientName, properties } = await req.json();
    await sendEmail(clientEmail, clientName, properties);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}); 

export const sendEmail = async (clientEmail: string, clientName: string, properties: any) => {
  // Render email HTML using react-email
  const emailHtml = await render(PropertyEmail({ 
    clientName,
    properties,
  }));

  // Send email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: clientEmail,
    subject: 'Properties You Might Be Interested In',
    html: emailHtml,
  });
};
