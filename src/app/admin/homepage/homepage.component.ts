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
    // remove the saved session so protected pages require a new login
    localStorage.removeItem('job_app_auth_user');

    // return the admin to the login page after clearing the session
    this.router.navigate(['/admin/login']);
  }
}
