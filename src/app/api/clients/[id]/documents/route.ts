import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];
    const formData = await request.formData();
    const files = formData.getAll('files');
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadPromises = files.map(async (file: any) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const key = `clients/${clientId}/documents/${uuidv4()}-${file.name}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        })
      );

      const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      // Create document record in database
      const document = await prisma.document.create({
        data: {
          clientId,
          name: file.name,
          type: type || 'OTHER',
          url,
          description,
          size: buffer.length,
          mimeType: file.type,
        },
      });

      return document;
    });

    const documents = await Promise.all(uploadPromises);

    // Create an interaction for the document upload
    await prisma.interaction.create({
      data: {
        clientId,
        type: 'DOCUMENT_UPLOADED',
        description: `Uploaded ${documents.length} document(s)`,
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error uploading documents:', error);
    return NextResponse.json(
      { error: 'Failed to upload documents' },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const documents = await prisma.document.findMany({
      where: {
        clientId,
        ...(type ? { type } : {}),
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];
    const { documentId } = await request.json();

    // Get the document to delete
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        clientId,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete from S3
    const key = document.url.split('.com/')[1];
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
      })
    );

    // Delete from database
    await prisma.document.delete({
      where: { id: documentId },
    });

    // Create an interaction for the deletion
    await prisma.interaction.create({
      data: {
        clientId,
        type: 'DOCUMENT_DELETED',
        description: `Deleted document: ${document.name}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
}; 