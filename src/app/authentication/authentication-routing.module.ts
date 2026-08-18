import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  // these redirects keep the short role urls pointing at their login forms
  { path: 'client', redirectTo: 'client/login', pathMatch: 'full' },
  { path: 'admin', redirectTo: 'admin/login', pathMatch: 'full' },

  // both roles share one login screen and the route selects the correct mode
  { path: 'client/login', component: LoginComponent, title: 'Client Login' },
  { path: 'admin/login', component: LoginComponent, title: 'Admin Login' },
  {
    path: 'client/register',
    component: RegisterComponent,
    title: 'Client Register'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule {}
