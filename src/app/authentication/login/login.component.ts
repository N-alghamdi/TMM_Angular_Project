import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../shared.service';
import { Accounts } from 'src/app/accounts';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // client is the default because only the admin route needs to change it
  role: string = 'client';

  // the fields start empty so they only hold what the user enters
  emailValue: string = '';
  passwordValue: string = '';

  // messages stay empty until a check finds something the user needs to fix
  emailError: string = '';
  passwordError: string = '';
  errorMessage: string = '';
  wrongRoleMessage: string = '';

  // the list starts empty until the account request returns
  accountsData: Accounts[] = [];

  constructor(private _sharedService: SharedService, private route: Router) {}

  ngOnInit() {
    // the route decides whether this form checks admin or client accounts
    if (this.route.url.includes('admin')) {
      this.role = 'admin';
    } else {
      this.role = 'client';
    }

    // the saved role stops one account type from using the other login page
    let savedSession = localStorage.getItem('job_app_auth_user');

    if (savedSession) {
      let userObj = JSON.parse(savedSession);

      // an admin must sign out before using the client login page
      if (this.role === 'client' && userObj.role === 'admin') {
        this.wrongRoleMessage =
          'You are already logged in as an Administrator, please log out first to access client functions';
      }

      // a client must sign out before using the admin login page
      else if (this.role === 'admin' && userObj.role === 'client') {
        this.wrongRoleMessage =
          'You are already logged in as a Client, please log out first to access the dashboard';
      }
    }

    // the account list is loaded once so the form can check the submitted details
    this._sharedService.getAccounts().subscribe({
      next: (data: Accounts[]) => {
        this.accountsData = data;
      }
    });
  }

  accountValidation() {
    // clear old messages before checking the new login attempt
    this.emailError = '';
    this.passwordError = '';
    this.errorMessage = '';

    // both fields need a value before the account can be checked
    if (!this.emailValue || this.emailValue.trim() === '') {
      this.emailError = 'Email cannot be empty';
    }
    if (!this.passwordValue || this.passwordValue.trim() === '') {
      this.passwordError = 'Password cannot be empty';
    }

    // invalid input should not reach the account search
    if (this.emailError !== '' || this.passwordError !== '') {
      return;
    }

    // a trimmed lowercase email keeps the search consistent with saved accounts
    let cleanEmail = this.emailValue.trim().toLowerCase();

    // checking the role keeps each account on the correct login page
    let foundAccount = this.accountsData.find(
      acc => acc.email === cleanEmail && acc.role === this.role
    );

    if (!foundAccount) {
      this.errorMessage = 'Account does not exist';
      return;
    }

    if (foundAccount.password !== this.passwordValue) {
      this.errorMessage = 'Incorrect password';
      return;
    }

    // only the details needed after login are kept in the browser
    let sessionObj = {
      id: foundAccount.id,
      email: foundAccount.email,
      role: foundAccount.role
    };

    // the route guards read this session when protected pages open
    localStorage.setItem('job_app_auth_user', JSON.stringify(sessionObj));

    // each role has its own home page after a successful login
    if (this.role === 'admin') {
      this.route.navigate(['/admin/homepage']);
    } else {
      this.route.navigate(['/client/homepage']);
    }
  }
}
