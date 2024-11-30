import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// POST /api/clients/[id]/documents - Add documents to a client
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/clients/')[1].split('/documents')[0];
    const { documents } = await request.json();

    if (!documents || !Array.isArray(documents)) {
      return NextResponse.json(
        { error: 'Documents array is required' },
        { status: 400 }
      );
    }

    // Add documents to the client
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        documents: {
          create: documents.map(doc => ({
            name: doc.name,
            url: doc.url,
            type: doc.type,
            uploadedAt: new Date(),
          })),
        },
      },
      include: {
        documents: true,
      },
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Error adding documents:', error);
    return NextResponse.json(
      { error: 'Failed to add documents' },
      { status: 500 }
    );
  }
});

// DELETE /api/clients/[id]/documents/[documentId] - Delete a document
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const urlParts = request.url.split('/');
    const documentId = urlParts[urlParts.length - 1];

    await prisma.document.delete({
      where: { id: documentId },
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