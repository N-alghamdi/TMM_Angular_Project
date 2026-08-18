// describes a job request as it moves through assignment and approval
export interface Jobs {
  id: string;
  jobTitle: string;
  jobDescription: string;
  experience: number;
  numberOfSeats: number;
  requestedWorkSite: string;
  requestedAvailability: string;

  // the status shows the current step from request to completed work
  status: string;

  // both lists use the same seat position to connect an employee with a decision
  assignedEmployeeIds: any[];
  assignedEmployeeStatuses: any[];
  requestedById: string;
  requestedByEmail: string;
  createdAt: string;
}
