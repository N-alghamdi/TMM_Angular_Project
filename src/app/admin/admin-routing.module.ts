import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { ActiveJobRequestComponent } from './active-job-request/active-job-request.component';
import { AdminGuard } from '../authentication/admin.guard';

const routes: Routes = [
  // guard each admin page so direct links still need an admin session
  {
    path: 'admin/homepage',
    component: HomepageComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/homepage/addEmployee',
    component: AddEmployeeComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/homepage/activeJobRequest',
    component: ActiveJobRequestComponent,
    canActivate: [AdminGuard]
  },

  // these repeated entries include titles for the matching admin paths
  { path: "admin/homepage", component: HomepageComponent, title: "Home Page" },
  {
    path: "admin/homepage/addEmployee",
    component: AddEmployeeComponent,
    title: "Add Employee"
  },
  {
    path: "admin/homepage/activeJobRequest",
    component: ActiveJobRequestComponent,
    title: "Active Job Requests"
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
