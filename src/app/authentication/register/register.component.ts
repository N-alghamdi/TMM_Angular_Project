import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../shared.service';
import { Accounts } from 'src/app/accounts';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
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

  constructor(private _sharedService: SharedService, private router: Router) {}

  ngOnInit() {
    // the page is blocked when an admin session is already active
    let savedSession = localStorage.getItem('job_app_auth_user');

    if (savedSession) {
      let userObj = JSON.parse(savedSession);

      if (userObj.role === 'admin') {
        this.wrongRoleMessage =
          'You are already logged in as an Administrator. Please log out first to access client functions.';
      }
    }

    // existing accounts are loaded so the email can be checked before saving
    this._sharedService.getAccounts().subscribe({
      next: (data: Accounts[]) => {
        this.accountsData = data;
      }
    });
  }

  accountValidation() {
    // clear old messages before checking the new registration attempt
    this.emailError = '';
    this.passwordError = '';
    this.errorMessage = '';

    // empty or short details should not create an account
    if (!this.emailValue || this.emailValue.trim() === '') {
      this.emailError = 'Email cannot be empty';
    } else if (this.emailValue.length < 8) {
      this.emailError = 'Email must be at least 8 characters';
    }

    if (!this.passwordValue || this.passwordValue.trim() === '') {
      this.passwordError = 'Password cannot be empty';
    } else if (this.passwordValue.length < 4) {
      this.passwordError = 'Password must be at least 4 characters';
    }

    // invalid input should not reach the account check
    if (this.emailError !== '' || this.passwordError !== '') {
      return;
    }

    // a trimmed lowercase email keeps the check consistent with saved accounts
    let cleanEmail = this.emailValue.trim().toLowerCase();

    // duplicate emails are stopped so each email belongs to one account
    const accountMatch = this.accountsData.some(account => account.email === cleanEmail);

    if (accountMatch) {
      this.errorMessage = 'Account already exists!';
      return;
    }

    // the current time records when the account was created
    const date = new Date();

    // every account made here is a client because this is the client sign up page
    const newAccount: Accounts = {
      id: String(this.accountsData.length + 1),
      email: cleanEmail,
      password: this.passwordValue.trim(),
      role: "client",
      createdAt: date.toISOString(),
    };

    // the account must be saved before a browser session is created
    this._sharedService.addAccount(newAccount).subscribe({
      next: () => {
        // signing in now avoids asking the new client to enter the same details again
        let sessionObj = {
          id: newAccount.id,
          email: newAccount.email,
          role: newAccount.role
        };
        localStorage.setItem('job_app_auth_user', JSON.stringify(sessionObj));

        // registration ends on the client home page
        this.router.navigate(['/client/homepage']);
      }
    });
  }
}
