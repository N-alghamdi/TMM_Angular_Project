import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ClientGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    // the saved session is the source used to decide whether this route can open
    let savedSession = localStorage.getItem('job_app_auth_user');

    if (savedSession) {
      let userObj = JSON.parse(savedSession);

      if (userObj.role === 'client') {
        // client session can open the requested page
        return true;
      } else {
        // admin stays in the admin area instead of opening client pages
        this.router.navigate(['/admin/homepage']);
        return false;
      }
    }

    // visitor without a session must sign in before opening client pages
    this.router.navigate(['/client/login']);
    return false;
  }
}
