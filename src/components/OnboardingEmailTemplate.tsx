interface OnboardingEmailProps {
  clientName: string;
  agentName: string;
  action: {
    title: string;
    description: string;
    type: string;
    dueDate?: string;
  };
  status: 'initiated' | 'completed';
}

export default function OnboardingEmailTemplate({
  clientName,
  agentName,
  action,
  status,
}: OnboardingEmailProps) {
  const getStatusMessage = () => {
    if (status === 'initiated') {
      return `Action Required: ${action.title}`;
    }
    return `Completed: ${action.title}`;
  };

  const getActionTypeMessage = () => {
    switch (action.type) {
      case 'DOCUMENT':
        return 'Please review and complete the required documentation.';
      case 'MEETING':
        return 'Please confirm your availability for the scheduled meeting.';
      case 'EMAIL':
        return 'Please review the information provided.';
      case 'TASK':
        return 'Please complete the requested task.';
      default:
        return '';
    }
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8fafc; padding: 24px;">
        <h1 style="color: #1e3a8a; margin-bottom: 16px;">
          ${getStatusMessage()}
        </h1>
        
        <p style="color: #475569; margin-bottom: 24px;">
          Dear ${clientName},
        </p>

        <div style="background-color: white; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #1e3a8a; margin-bottom: 16px;">
            ${action.title}
          </h2>
          
          <p style="color: #475569; margin-bottom: 16px;">
            ${action.description}
          </p>

          ${action.dueDate ? `
            <p style="color: #475569; margin-bottom: 16px;">
              Due Date: ${new Date(action.dueDate).toLocaleDateString()}
            </p>
          ` : ''}

          <p style="color: #475569; margin-bottom: 16px;">
            ${getActionTypeMessage()}
          </p>
        </div>

        ${status === 'initiated' ? `
          <div style="background-color: #dbeafe; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="color: #1e40af; margin: 0;">
              Please take action on this request at your earliest convenience.
            </p>
          </div>
        ` : `
          <div style="background-color: #dcfce7; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="color: #166534; margin: 0;">
              This action has been completed successfully.
            </p>
          </div>
        `}

        <p style="color: #475569; margin-bottom: 8px;">
          Best regards,
        </p>
        <p style="color: #475569;">
          ${agentName}
        </p>
      </div>
    </div>
  `;
} 