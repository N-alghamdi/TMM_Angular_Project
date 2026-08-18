import { Component, OnInit } from '@angular/core';
import { Jobs } from 'src/app/jobs';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-create-job-request',
  templateUrl: './create-job-request.component.html',
  styleUrls: ['./create-job-request.component.css']
})
export class CreateJobRequestComponent implements OnInit {
  // keep the success message hidden until the server saves a request
  showSuccessMessage: boolean = false;

  // these starting values match the empty fields and number defaults in the form
  jobTitle: string = '';
  jobDescription: string = '';
  experience: number = 0;
  employeesNeeded: number = 1;
  workType: string = '';
  availability: string = '';

  // begin with no jobs because the current list loads from the server
  jobsData: Jobs[] = [];

  // empty error text keeps validation messages hidden before the first check
  jobTitleError: string = '';
  jobDescriptionError: string = '';
  workTypeError: string = '';
  availabilityError: string = '';

  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.sharedService.getJobs().subscribe({
      next: (data) => {
        // the current jobs provide the next id for a new request
        this.jobsData = data;
      },
    });
  }

  // save a new job only after every required field has a value
  saveJob() {
    // clear old errors before checking the current form values
    this.jobTitleError = '';
    this.jobDescriptionError = '';
    this.workTypeError = '';
    this.availabilityError = '';

    if (this.jobTitle.trim() === '') {
      this.jobTitleError = 'Job Title is required';
    }

    if (this.jobDescription.trim() === '') {
      this.jobDescriptionError = 'Job Description is required';
    }

    if (this.workType === '') {
      this.workTypeError = 'Please select work type';
    }

    if (this.availability === '') {
      this.availabilityError = 'Please select availability';
    }

    // stop here so an incomplete request is never sent to the server
    if (
      this.jobTitleError !== '' ||
      this.jobDescriptionError !== '' ||
      this.workTypeError !== '' ||
      this.availabilityError !== ''
    ) {
      return;
    }

    // the saved client details link the request to the account that created it
    let savedSession = localStorage.getItem('job_app_auth_user');

    // these values stay empty when the browser has no saved client session
    let currentClientId = '';
    let currentClientEmail = '';

    if (savedSession) {
      let userObj = JSON.parse(savedSession);
      currentClientId = userObj.id;
      currentClientEmail = userObj.email;
    }

    const date = new Date();
    // new requests start as pending without any employee assignments
    const newJob: Jobs = {
      id: String(this.jobsData.length + 1),
      jobTitle: this.jobTitle,
      jobDescription: this.jobDescription,
      experience: this.experience,
      numberOfSeats: this.employeesNeeded,
      requestedWorkSite: this.workType,
      requestedAvailability: this.availability,
      status: "pending",
      assignedEmployeeIds: [],
      assignedEmployeeStatuses: [],
      requestedById: currentClientId,
      requestedByEmail: currentClientEmail,
      createdAt: date.toISOString(),
    }

    // save the complete request before clearing the form
    this.sharedService.addJobs(newJob).subscribe({
      next: () => {
        // reset the form only after the server accepts the request
        this.jobTitle = "";
        this.jobDescription = "";
        this.jobTitle = "";
        this.experience = 0;
        this.workType = "";
        this.availability = "";
        this.employeesNeeded = 1;

        // show a short confirmation so the client knows the save worked
        this.showSuccessMessage = true;

        // hide the confirmation after ten seconds so it does not stay on the form
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 10000);
      }
    })
  }
}
