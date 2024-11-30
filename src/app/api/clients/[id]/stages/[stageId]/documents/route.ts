import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// POST /api/clients/[id]/documents - Add documents to a client's stage
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/clients/')[1].split('/documents')[0];
    const { documents, stageId } = await request.json();

    if (!Array.isArray(documents)) {
      return NextResponse.json(
        { error: 'Documents array is required' },
        { status: 400 }
      );
    }

    // Create documents for the specified stage
    const stage = await prisma.stage.update({
      where: { id: stageId },
      data: {
        documents: {
          create: documents.map(doc => ({
            name: doc.name,
            url: doc.url,
            type: doc.type,
            uploadedAt: new Date()
          }))
        }
      },
      include: {
        documents: true,
      },
    });

    // Create an interaction record with clientId
    await prisma.interaction.create({
      data: {
        clientId: id,
        type: 'Document Upload',
        description: `Uploaded ${documents.length} documents`,
        date: new Date(),
      }
    });

    return NextResponse.json(stage);
  } catch (error) {
    console.error('Error uploading documents:', error);
    return NextResponse.json(
      { error: 'Failed to upload documents' },
      { status: 500 }
    );
  }
});

// GET /api/clients/[id]/documents - Get all documents for a client's stage
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const stageId = searchParams.get('stageId');

    if (!stageId) {
      return NextResponse.json(
        { error: 'Stage ID is required' },
        { status: 400 }
      );
    }

    const documents = await prisma.document.findMany({
      where: {
        stageId
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
});

// DELETE /api/clients/[id]/documents/[documentId] - Delete a document
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const documentId = request.url.split('/').pop();

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    await prisma.document.delete({
      where: { id: documentId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}); 