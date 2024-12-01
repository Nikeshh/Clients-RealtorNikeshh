export const getDefaultProcesses = (requestType: string) => {
  switch (requestType) {
    case 'RENTAL':
      return [
        {
          title: 'Initial Consultation',
          description: 'Meet with client to discuss rental requirements',
          type: 'MEETING',
          tasks: [
            { type: 'DOCUMENT', title: 'Collect ID Documents' },
            { type: 'DOCUMENT', title: 'Proof of Income' }
          ]
        },
        {
          title: 'Property Search',
          description: 'Search and shortlist properties',
          type: 'TASK',
          tasks: [
            { type: 'TASK', title: 'Create property shortlist' },
            { type: 'EMAIL', title: 'Send property recommendations' }
          ]
        },
        {
          title: 'Property Viewings',
          description: 'Schedule and conduct property viewings',
          type: 'MEETING',
          tasks: [
            { type: 'TASK', title: 'Schedule viewings' },
            { type: 'EMAIL', title: 'Send viewing confirmations' }
          ]
        },
        {
          title: 'Application Process',
          description: 'Help with rental application',
          type: 'TASK',
          tasks: [
            { type: 'DOCUMENT', title: 'Complete rental application' },
            { type: 'DOCUMENT', title: 'Submit required documents' }
          ]
        }
      ];
    case 'BUYING':
      return [
        {
          title: 'Initial Consultation',
          description: 'Meet with client to discuss buying requirements',
          type: 'MEETING',
          tasks: [
            { type: 'DOCUMENT', title: 'Mortgage Pre-approval' },
            { type: 'DOCUMENT', title: 'Buyer Agreement' }
          ]
        },
        {
          title: 'Property Search',
          description: 'Search and shortlist properties',
          type: 'TASK',
          tasks: [
            { type: 'TASK', title: 'Create property shortlist' },
            { type: 'EMAIL', title: 'Send property recommendations' }
          ]
        },
        {
          title: 'Property Viewings',
          description: 'Schedule and conduct property viewings',
          type: 'MEETING',
          tasks: [
            { type: 'TASK', title: 'Schedule viewings' },
            { type: 'EMAIL', title: 'Send viewing confirmations' }
          ]
        },
        {
          title: 'Offer Process',
          description: 'Prepare and submit offer',
          type: 'TASK',
          tasks: [
            { type: 'DOCUMENT', title: 'Prepare offer' },
            { type: 'DOCUMENT', title: 'Review conditions' }
          ]
        }
      ];
    case 'SELLER':
      return [
        {
          title: 'Initial Consultation',
          description: 'Meet with client to discuss selling strategy',
          type: 'MEETING',
          tasks: [
            { type: 'DOCUMENT', title: 'Listing Agreement' },
            { type: 'TASK', title: 'Property Valuation' }
          ]
        },
        {
          title: 'Property Preparation',
          description: 'Prepare property for listing',
          type: 'TASK',
          tasks: [
            { type: 'TASK', title: 'Professional photos' },
            { type: 'TASK', title: 'Property staging' }
          ]
        },
        {
          title: 'Marketing',
          description: 'Market the property',
          type: 'TASK',
          tasks: [
            { type: 'TASK', title: 'Create listing' },
            { type: 'TASK', title: 'Social media marketing' }
          ]
        },
        {
          title: 'Showings',
          description: 'Manage property showings',
          type: 'TASK',
          tasks: [
            { type: 'TASK', title: 'Schedule showings' },
            { type: 'EMAIL', title: 'Collect feedback' }
          ]
        }
      ];
    default:
      return [];
  }
}; 