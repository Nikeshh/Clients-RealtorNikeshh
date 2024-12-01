import prisma from '@/lib/prisma';

type TaskType = 'EMAIL' | 'DOCUMENT_REQUEST' | 'CALENDAR_INVITE';

interface ProcessTaskData {
  type: TaskType;
  to?: string;
  subject?: string;
  content?: string;
  clientId?: string;
  title?: string;
  description?: string;
  dueDate?: Date;
  suggestedDate?: Date;
}

export class ProcessTaskProcessor {
  static async processTask(taskId: string, data: ProcessTaskData): Promise<void> {
    switch (data.type) {
      case 'EMAIL':
        if (!data.to || !data.subject || !data.content) {
          throw new Error('Missing required fields for email task');
        }
        await prisma.emailQueue.create({
          data: {
            to: data.to,
            subject: data.subject,
            content: data.content,
            status: 'PENDING'
          }
        });
        break;

      case 'DOCUMENT_REQUEST':
        if (!data.clientId || !data.title || !data.description || !data.dueDate) {
          throw new Error('Missing required fields for document request task');
        }
        await prisma.documentRequest.create({
          data: {
            clientId: data.clientId,
            title: data.title,
            description: data.description,
            status: 'PENDING',
            dueDate: data.dueDate
          }
        });
        break;

      case 'CALENDAR_INVITE':
        if (!data.clientId || !data.title || !data.description || !data.suggestedDate) {
          throw new Error('Missing required fields for calendar invite task');
        }
        await prisma.meeting.create({
          data: {
            clientId: data.clientId,
            title: data.title,
            description: data.description,
            status: 'PENDING',
            suggestedDate: data.suggestedDate
          }
        });
        break;

      default:
        throw new Error(`Unsupported task type: ${data.type}`);
    }

    await prisma.processTask.update({
      where: { id: taskId },
      data: { status: 'COMPLETED', completedAt: new Date() }
    });
  }
} 