interface ProcessEmailTemplateProps {
  clientName: string;
  agentName: string;
  agentEmail: string;
  agentPhone: string;
  action: {
    title: string;
    description: string;
    type: string;
    dueDate?: string;
  };
}

export default function ProcessEmailTemplate({
  clientName,
  agentName,
  agentEmail,
  agentPhone,
  action,
}: ProcessEmailTemplateProps): string {
  return `
Dear ${clientName},

I hope this email finds you well. I wanted to inform you about a new action item in your process:

${action.title}

${action.description}

${action.dueDate ? `Due Date: ${new Date(action.dueDate).toLocaleDateString()}` : ''}

Type: ${action.type}

Please let me know if you have any questions or need any assistance with this task.

Best regards,
${agentName}
${agentPhone}
${agentEmail}
  `.trim();
} 