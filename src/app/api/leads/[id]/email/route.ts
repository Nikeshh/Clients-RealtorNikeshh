import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const leadId = request.url.split('/leads/')[1].split('/')[0];
    const { subject, content } = await request.json();

    // Get the lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead || !lead.email) {
      return NextResponse.json(
        { error: 'Lead not found or has no email' },
        { status: 404 }
      );
    }

    // Send email
    const emailInfo = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: lead.email,
      subject: subject,
      text: content,
      html: content.replace(/\n/g, '<br>'),
      headers: {
        'X-Lead-ID': leadId,
        'X-Email-Type': 'LEAD_COMMUNICATION',
      },
    });

    // Create detailed email interaction record
    const interaction = await prisma.leadInteraction.create({
      data: {
        type: 'EMAIL',
        content: JSON.stringify({
          subject,
          body: content,
          messageId: emailInfo.messageId,
          timestamp: new Date().toISOString(),
          sender: process.env.EMAIL_FROM_ADDRESS,
          recipient: lead.email,
          status: 'SENT',
        }, null, 2), // Pretty print JSON
        leadId: lead.id,
      },
    });

    // Update lead's last contact and email count
    const updatedLead = await prisma.lead.update({
      where: { id: lead.id },
      data: {
        lastContact: new Date(),
        emailsSent: (lead.emailsSent || 0) + 1
      },
    });

    // Log email details for debugging/tracking
    console.log('Email sent:', {
      leadId,
      messageId: emailInfo.messageId,
      recipient: lead.email,
      subject,
      timestamp: new Date().toISOString(),
      sender: process.env.EMAIL_FROM_ADDRESS,
      emailsSent: updatedLead.emailsSent,
    });

    return NextResponse.json({ 
      success: true, 
      interaction,
      emailInfo: {
        messageId: emailInfo.messageId,
        accepted: emailInfo.accepted,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Email Error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: (error as Error).message },
      { status: 500 }
    );
  }
}); 