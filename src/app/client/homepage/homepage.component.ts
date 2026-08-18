import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
  constructor(private router: Router) {}

  logout() {
    // clearing the saved session makes the guard treat the client as signed out
    localStorage.removeItem('job_app_auth_user');

    // return the client to the login page after signing out
    this.router.navigate(['/client/login']);
  }
}
