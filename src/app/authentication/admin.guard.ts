import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    // the saved session is the source used to decide whether this route can open
    let savedSession = localStorage.getItem('job_app_auth_user');

    if (savedSession) {
      let userObj = JSON.parse(savedSession);

      if (userObj.role === 'admin') {
        // admin session can open the requested page
        return true;
      } else {
        // client stays in the client area instead of opening admin pages
        this.router.navigate(['/client/homepage']);
        return false;
      }
    }

    // visitor without a session must sign in before opening admin pages
    this.router.navigate(['/admin/login']);
    return false;
  }
}
