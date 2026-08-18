import { Component, OnInit } from '@angular/core';
import { Employees } from 'src/app/employees';
import { Jobs } from 'src/app/jobs';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-track-job-requests',
  templateUrl: './track-job-requests.component.html',
  styleUrls: ['./track-job-requests.component.css']
})
export class TrackJobRequestsComponent implements OnInit {
  // the employee id keeps the error beside the correct employee card
  cvErrorEmployeeId: string = '';

  // these lists stay empty until their data arrives from the server
  clientJobs: Jobs[] = [];
  employeeData: Employees[] = [];

  // null means the client has not chosen a job to view yet
  selectedJob: Jobs | null = null;

  // no employee cards are needed before a job is selected
  assignedEmployeesList: Employees[] = [];

  // this older flag stays false because file errors now use the employee id above
  cvErrorMessage: boolean = false;

  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    // use the saved client id to find requests from this account
    let savedSession = localStorage.getItem('job_app_auth_user');

    // the id stays empty when the browser has no saved client session
    let loggedInClientId = '';

    if (savedSession) {
      let userObj = JSON.parse(savedSession);
      loggedInClientId = userObj.id;
    }

    // only show jobs created by the signed in client
    this.sharedService.getJobs().subscribe({
      next: (jobs: Jobs[]) => {
        this.clientJobs = jobs.filter(
          job => job.requestedById == loggedInClientId
        );
      }
    });

    // full employee details are needed when assigned ids are shown below
    this.sharedService.getEmployee().subscribe({
      next: (emps: Employees[]) => {
        this.employeeData = emps;
      }
    });
  }

  // rebuild the details when the client selects a different job
  onJobSelected(jobId: string) {
    this.cvErrorMessage = false;

    let foundJob = this.clientJobs.find(job => job.id == jobId);

    if (foundJob) {
      this.selectedJob = foundJob;

      // clear the old list before showing employees for the new job
      this.assignedEmployeesList = [];

      // turn the saved employee ids into the full records used by the template
      if (this.selectedJob.assignedEmployeeIds) {
        for (let i = 0; i < this.selectedJob.assignedEmployeeIds.length; i++) {
          let targetId = this.selectedJob.assignedEmployeeIds[i];
          let foundEmp = this.employeeData.find(emp => emp.id == targetId);

          if (foundEmp) {
            this.assignedEmployeesList.push(foundEmp);
          }
        }
      }
    } else {
      // an empty choice hides details from the previous job
      this.selectedJob = null;
    }
  }

  // employee ids and statuses use the same position in their arrays
  getEmployeeStatus(empId: string): string {
    if (
      !this.selectedJob ||
      !this.selectedJob.assignedEmployeeIds ||
      !this.selectedJob.assignedEmployeeStatuses
    ) {
      return '';
    }

    let seatPosition = this.selectedJob.assignedEmployeeIds.indexOf(empId);

    if (seatPosition !== -1) {
      return this.selectedJob.assignedEmployeeStatuses[seatPosition];
    }

    return '';
  }

  // update the employee and job records after the client makes a decision
  changeStatus(empId: string, newStatus: string) {
    if (
      !this.selectedJob ||
      !this.selectedJob.assignedEmployeeIds ||
      !this.selectedJob.assignedEmployeeStatuses
    ) {
      return;
    }

    // decisions stay locked after the job starts or finishes
    if (
      this.selectedJob.status === 'working' ||
      this.selectedJob.status === 'done'
    ) {
      return;
    }

    let seatPosition = this.selectedJob.assignedEmployeeIds.indexOf(empId);

    if (seatPosition !== -1) {
      this.selectedJob.assignedEmployeeStatuses[seatPosition] = newStatus;

      let foundEmp = this.employeeData.find(emp => emp.id == empId);

      if (foundEmp) {
        // approved employees stay busy while denied employees can take another job
        if (newStatus === 'approved') {
          foundEmp.available = false;
        } else if (newStatus === 'denied') {
          foundEmp.available = true;
        }

        this.sharedService.modifyEmployee(foundEmp).subscribe();
      }

      // this count has no effect on the saved job and is kept for later use
      let approvedCount = 0;

      for (let i = 0; i < this.selectedJob.assignedEmployeeStatuses.length; i++) {
        if (this.selectedJob.assignedEmployeeStatuses[i] === 'approved') {
          approvedCount++;
        }
      }

      // save the client decision after both records have been updated
      this.sharedService.modifyJob(this.selectedJob).subscribe();
    }
  }

  // open the saved cv data as a file in a new browser tab
  viewCV(employee: Employees) {
    // clear the old error before checking the selected employee
    this.cvErrorEmployeeId = '';

    if (!employee.cv || !employee.cv.dataBase64 || !employee.cv.fileType) {
      // save the id so only this employee card shows the error
      this.cvErrorEmployeeId = employee.id;
      return;
    }

    let actualBase64 = employee.cv.dataBase64;

    // remove a data url prefix because the decoder only needs the encoded content
    if (actualBase64.includes(',')) {
      let parts = actualBase64.split(',');
      actualBase64 = parts[1];
    }

    // turn the stored base64 text into bytes that the browser can use
    let binaryString = window.atob(actualBase64);
    let binaryLen = binaryString.length;
    let bytes = new Uint8Array(binaryLen);

    for (let i = 0; i < binaryLen; i++) {
      let ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }

    // keep the original file type so the browser opens the cv correctly
    let fileBlob = new Blob([bytes], { type: employee.cv.fileType });

    // a temporary url lets the browser open the file without saving it first
    let fileUrl = URL.createObjectURL(fileBlob);

    window.open(fileUrl, '_blank');

    // release the temporary url after it is sent to the browser
    URL.revokeObjectURL(fileUrl);
  }
}
