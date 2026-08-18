import { Component, OnInit } from '@angular/core';
import { Employees } from 'src/app/employees';
import { Jobs } from 'src/app/jobs';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-active-job-request',
  templateUrl: './active-job-request.component.html',
  styleUrls: ['./active-job-request.component.css'],
})
export class ActiveJobRequestComponent implements OnInit {
  // an empty job id keeps every assignment panel closed at first
  selectedJobId: string = '';

  // start with empty lists because job and employee data load after the page opens
  jobData: Jobs[] = [];
  employeeData: Employees[] = [];

  // keep seat choices empty until the admin opens an assignment panel
  selectedSeats: string[] = [];

  // start with clear error values so no warning appears before a save attempt
  emptyAssignempMessage: string = '';
  displaySeatErrorMsg: boolean = false;
  doublicateEmp: boolean = false;

  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.sharedService.getJobs().subscribe({
      next: (data: Jobs[]) => {
        this.jobData = data;
      },
    });

    this.sharedService.getEmployee().subscribe({
      next: (data: Employees[]) => {
        this.employeeData = data;
      },
    });
  }

  showAssignDetailes(jobInfoCard: Jobs) {
    this.displaySeatErrorMsg = false;

    if (this.selectedJobId === jobInfoCard.id) {
      this.selectedJobId = '';
    } else {
      this.selectedJobId = jobInfoCard.id;

      // copy saved assignments so reopening the panel keeps the current choices
      if (jobInfoCard.assignedEmployeeIds) {
        this.selectedSeats = [...jobInfoCard.assignedEmployeeIds];
      } else {
        this.selectedSeats = [];
      }

      // fill unused positions so every seat has a value the select can bind to
      for (let i = 0; i < jobInfoCard.numberOfSeats; i++) {
        if (!this.selectedSeats[i]) {
          this.selectedSeats[i] = '';
        }
      }
    }
  }

  // build indexes because the template uses each value to bind a seat
  getSeat(count: number) {
    let seat = [];

    for (let i = 0; i < count; i++) {
      seat.push(i);
    }

    return seat;
  }

  SeatErrors(jobInfoCard: Jobs) {
    this.doublicateEmp = false;

    let newCleanIds: string[] = [];
    let seenEmployees: string[] = [];

    // collect filled seats while checking that one employee is not selected twice
    for (let i = 0; i < jobInfoCard.numberOfSeats; i++) {
      let currentId = this.selectedSeats[i];

      if (currentId && currentId !== '') {
        if (seenEmployees.includes(currentId)) {
          this.doublicateEmp = true;
        } else {
          seenEmployees.push(currentId);
          newCleanIds.push(currentId);
        }
      }
    }

    // keep the saved assignments unchanged when one employee fills several seats
    if (this.doublicateEmp === true) {
      return;
    }

    // compare old and new choices so employee availability stays correct
    let oldIds = jobInfoCard.assignedEmployeeIds || [];

    // release employees removed from this job so they can be assigned elsewhere
    for (let i = 0; i < oldIds.length; i++) {
      let oldId = oldIds[i];

      if (oldId !== '' && !newCleanIds.includes(oldId)) {
        let empToFree = this.employeeData.find((e) => e.id == oldId);

        if (empToFree) {
          empToFree.available = true;
          this.sharedService.modifyEmployee(empToFree).subscribe();
        }
      }
    }

    // reserve newly selected employees so another job cannot assign them
    for (let i = 0; i < newCleanIds.length; i++) {
      let newId = newCleanIds[i];

      if (!oldIds.includes(newId)) {
        let empToLock = this.employeeData.find((e) => e.id == newId);

        if (empToLock) {
          empToLock.available = false;
          this.sharedService.modifyEmployee(empToLock).subscribe();
        }
      }
    }

    let seatStatuses: string[] = [];

    // move jobs with assignments into approval and return empty jobs to pending
    if (newCleanIds.length > 0) {
      jobInfoCard.status = 'waiting for approve';

      for (let i = 0; i < jobInfoCard.numberOfSeats; i++) {
        seatStatuses.push('pending approve');
      }
    } else {
      jobInfoCard.status = 'pending';

      for (let i = 0; i < jobInfoCard.numberOfSeats; i++) {
        seatStatuses.push('pending');
      }
    }

    // keep the full seat list so empty positions stay in their original order
    jobInfoCard.assignedEmployeeStatuses = seatStatuses;
    jobInfoCard.assignedEmployeeIds = [...this.selectedSeats];

    // save the assignment changes so every page gets the same job state
    this.sharedService.modifyJob(jobInfoCard).subscribe();

    this.selectedJobId = '';
  }

  getAssignedEmployeeText(jobInfoCard: Jobs): string {
    // return a clear empty state when the job has no saved seat data
    if (
      !jobInfoCard.assignedEmployeeIds ||
      jobInfoCard.assignedEmployeeIds.length === 0
    ) {
      return 'No one assigned yet.';
    }

    let validIds = [];

    // keep saved employees even though assigned employees are unavailable
    for (let i = 0; i < jobInfoCard.assignedEmployeeIds.length; i++) {
      let savedId = jobInfoCard.assignedEmployeeIds[i];

      if (savedId && savedId !== '') {
        let foundEmployee = this.employeeData.find((emp) => emp.id == savedId);

        if (foundEmployee) {
          validIds.push(savedId);
        }
      }
    }

    if (validIds.length === 0) {
      return 'No one assigned yet.';
    }

    // join the ids into a short list that fits naturally on the job card
    return validIds.join(', ');
  }

  // allow a job to start only after every required seat has approval
  canStartJob(jobInfoCard: Jobs): boolean {
    if (
      !jobInfoCard.assignedEmployeeStatuses ||
      jobInfoCard.assignedEmployeeStatuses.length === 0
    ) {
      return false;
    }

    if (jobInfoCard.status === 'working' || jobInfoCard.status === 'done') {
      return false;
    }

    let approvedCount = 0;

    for (let i = 0; i < jobInfoCard.assignedEmployeeStatuses.length; i++) {
      if (jobInfoCard.assignedEmployeeStatuses[i] === 'approved') {
        approvedCount++;
      }
    }

    if (approvedCount > 0 && approvedCount === jobInfoCard.numberOfSeats) {
      return true;
    }

    return false;
  }

  startJob(jobInfoCard: Jobs) {
    jobInfoCard.status = 'working';

    // keep assigned employees unavailable while the job is in progress
    if (jobInfoCard.assignedEmployeeIds) {
      for (let i = 0; i < jobInfoCard.assignedEmployeeIds.length; i++) {
        let empId = jobInfoCard.assignedEmployeeIds[i];
        let foundEmp = this.employeeData.find(e => e.id == empId);

        if (foundEmp) {
          foundEmp.available = false;
          this.sharedService.modifyEmployee(foundEmp).subscribe();
        }
      }
    }

    // save the working state so the rest of the app can see the job started
    this.sharedService.modifyJob(jobInfoCard).subscribe();
  }

  doneJob(jobInfoCard: Jobs) {
    jobInfoCard.status = 'done';

    // release assigned employees because a completed job no longer needs them
    if (jobInfoCard.assignedEmployeeIds) {
      for (let i = 0; i < jobInfoCard.assignedEmployeeIds.length; i++) {
        let empId = jobInfoCard.assignedEmployeeIds[i];
        let foundEmp = this.employeeData.find(e => e.id == empId);

        if (foundEmp) {
          foundEmp.available = true;
          this.sharedService.modifyEmployee(foundEmp).subscribe();
        }
      }
    }

    // save the completed state so the job leaves the active request list
    this.sharedService.modifyJob(jobInfoCard).subscribe();
  }

  deleteJob(jobInfoCard: Jobs) {
    // release assigned employees before deleting the job that reserved them
    if (jobInfoCard.assignedEmployeeIds) {
      for (let i = 0; i < jobInfoCard.assignedEmployeeIds.length; i++) {
        let empId = jobInfoCard.assignedEmployeeIds[i];
        let foundEmp = this.employeeData.find(e => e.id == empId);

        if (foundEmp) {
          foundEmp.available = true;
          this.sharedService.modifyEmployee(foundEmp).subscribe();
        }
      }
    }

    this.sharedService.deleteJob(jobInfoCard.id).subscribe({
      next: () => {
        // remove the saved job locally so the card disappears without a reload
        this.jobData = this.jobData.filter(j => j.id !== jobInfoCard.id);
      }
    });
  }

  // hide the no jobs message while at least one unfinished job remains
  hasActiveJobs(): boolean {
    return this.jobData.some(job => job.status !== 'done');
  }
}
