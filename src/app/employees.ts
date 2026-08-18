// describes the employee data used for job assignment and availability
export interface Employees {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  experience: number;
  workSite: string;

  // availability stores the work schedule while available shows if a job can use this employee
  availability: string;
  available: boolean;

  // the cv is stored as text so it can stay inside the local json data
  cv: {
    fileName: string;
    fileType: string;
    dataBase64: string;
  };
  createdAt: string;
}
