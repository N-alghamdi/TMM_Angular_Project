import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Accounts } from './accounts';
import { Employees } from './employees';
import { Jobs } from './jobs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  constructor(private _httpClient: HttpClient) {}

  //  loads accounts so login and registration can check the user details
  getAccounts(): Observable<any> {
    return this._httpClient.get('http://localhost:3002/accounts');
  }

  // loads  employees for job assignment and availability updates
  getEmployee(): Observable<any> {
    return this._httpClient.get('http://localhost:3003/employees');
  }

  //loads jobs so admin and client pages use the same request data
  getJobs(): Observable<any> {
    return this._httpClient.get('http://localhost:3001/jobs');
  }







  // creates an account after the registration details are valid
  addAccount(account: Accounts): Observable<any> {
    return this._httpClient.post('http://localhost:3002/accounts', account);
  }

  // creates an employee so the admin can assign them to jobs
  addEmployee(employee: Employees): Observable<any> {
    return this._httpClient.post('http://localhost:3003/employees', employee);
  }

  // creates a job request for the admin to review
  addJobs(job: Jobs): Observable<any> {
    return this._httpClient.post('http://localhost:3001/jobs', job);
  }







  // saves assignment approval and status changes for a job
  modifyJob(job: Jobs): Observable<any> {
    return this._httpClient.patch(`http://localhost:3001/jobs/${job.id}`, job);
  }

  // saves an employee when their availability changes
  modifyEmployee(employee: Employees): Observable<any> {
    return this._httpClient.patch(
      `http://localhost:3003/employees/${employee.id}`,
      employee
    );
  }





  // removes a job after its employees are ready for other work
  deleteJob(jobId: string) {
    return this._httpClient.delete(`http://localhost:3001/jobs/${jobId}`);
  }
}
