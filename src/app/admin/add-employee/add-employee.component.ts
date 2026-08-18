import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/shared.service';
import { Employees } from 'src/app/employees';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css']
})
export class AddEmployeeComponent implements OnInit {
  // keep the success message hidden until an employee is saved
  showSuccessMessage: boolean = false;

  // start with an empty form so no old employee details are shown
  firstName: string = '';
  lastName: string = '';
  jobTitle: string = '';
  experience: number = 0;
  workSite: string = '';
  availability: string = '';

  // keep file details empty until a valid pdf finishes loading
  currentBase64: string = '';
  fileName: string = '';
  fileType: string = '';

  // empty error text keeps all validation messages hidden at first
  pdfError: string = '';
  firstNameError: string = '';
  lastNameError: string = '';
  jobTitleError: string = '';
  workSiteError: string = '';
  availabilityError: string = '';

  // begin with no employees because the current list loads from the server
  employeeData: Employees[] = [];

  constructor(private _sharedService: SharedService) {}

  ngOnInit() {
    this._sharedService.getEmployee().subscribe({
      next: (data) => {
        // keep the list because its length is used for the next employee id
        this.employeeData = data;
      },
    });
  }

  // check the cv before reading it because only small pdf files can be saved
  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    // clear the saved file content so an invalid file cannot be sent by mistake
    if (file.type !== 'application/pdf') {
      this.pdfError = "Invalid file. Only PDF files are allowed.";
      this.currentBase64 = "";
      return;
    }

    // keep the file small enough to fit in the local json data
    if (file.size > 70 * 1024) {
      this.pdfError = "File is too large. Maximum size is 70 KB.";
      this.currentBase64 = "";
      return;
    }

    // remove the old message once the selected file passes both checks
    this.pdfError = '';

    // convert the file to base64 text because json cannot save a file object
    const reader = new FileReader();

    // save the file details only after the browser finishes reading the file
    reader.onload = () => {
      this.currentBase64 = reader.result as string;
      this.fileName = file.name;
      this.fileType = file.type;
    };

    reader.readAsDataURL(file);
  }

  saveEmployee() {
    // clear old field messages before checking the current form values
    this.firstNameError = '';
    this.lastNameError = '';
    this.jobTitleError = '';
    this.workSiteError = '';
    this.availabilityError = '';

    // check each field alone so the user sees every missing value at once
    if (this.firstName.trim() === '') {
      this.firstNameError = 'First Name is required';
    }

    if (this.lastName.trim() === '') {
      this.lastNameError = 'Last Name is required';
    }

    if (this.jobTitle.trim() === '') {
      this.jobTitleError = 'Job Title is required';
    }

    if (this.workSite === '') {
      this.workSiteError = 'Please select Work Site';
    }

    if (this.availability === '') {
      this.availabilityError = 'Please select availability';
    }

    // require a valid cv because text fields alone do not complete the record
    if (this.currentBase64 === '') {
      this.pdfError = 'Please upload a valid pdf CV';
    }

    // stop here so invalid form data never reaches the server
    if (
      this.firstNameError !== '' ||
      this.lastNameError !== '' ||
      this.jobTitleError !== '' ||
      this.workSiteError !== '' ||
      this.availabilityError !== '' ||
      this.pdfError !== ''
    ) {
      return;
    }

    // build the employee record only after every form value is valid
    const newEmployee: Employees = {
      // use the list length to keep ids in order in the local data store
      id: String(this.employeeData.length + 1),
      firstName: this.firstName,
      lastName: this.lastName,
      jobTitle: this.jobTitle,
      experience: this.experience,
      workSite: this.workSite,
      availability: this.availability,
      available: true,
      cv: {
        fileName: this.fileName,
        fileType: this.fileType,
        dataBase64: this.currentBase64,
      },
      createdAt: new Date().toISOString(),
    };

    // wait for the save to finish before clearing the form
    this._sharedService.addEmployee(newEmployee).subscribe({
      next: () => {
        // clear text values so the form is ready for another employee
        this.firstName = '';
        this.lastName = '';
        this.jobTitle = '';

        // return the number and select fields to their starting values
        this.experience = 0;
        this.workSite = '';
        this.availability = '';

        this.currentBase64 = '';
        this.fileName = '';
        this.fileType = '';

        // clear the file input because the browser keeps its shown path
        const cvElement = document.getElementById('cv') as HTMLInputElement;

        if (cvElement) {
          cvElement.value = '';
        }

        this.showSuccessMessage = true;

        // hide the message later so it does not stay on the page
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 10000);
      },
    });
  }
}
