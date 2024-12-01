import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import prisma from "@/lib/prisma";
import PropertyEmail from "@/emails/PropertyEmail";
import nodemailer from "nodemailer";
import { renderAsync } from "@react-email/render";

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
    const clientId = request.url.split("/clients/")[1].split("/")[0];
    const requirementId = request.url.split("/requirements/")[1].split("/")[0];
    const { subject, message, properties } = await request.json();

    // Get the client's email
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { email: true, name: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    let emailComponent;
    let template = "PropertyEmail";
    switch (template) {
      case "PropertyEmail":
        emailComponent = PropertyEmail({
          clientName: client.name,
          message: message,
          properties: properties.map((property: any) => ({
            title: property.title,
            address: property.address,
            price: property.price,
            imageUrl: property.images?.[0],
            link: property.link,
          })),
        });
        break;
      default:
        return NextResponse.json(
          { error: "Invalid template" },
          { status: 400 }
        );
    }

    const to = client.email;

    // Render React component to HTML
    const html = await renderAsync(emailComponent);

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM || '"Real Estate CRM" <noreply@yourdomain.com>',
      to,
      subject,
      html,
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId,
        type: "EMAIL_SENT",
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
        status: "SENT",
        sentAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
});
