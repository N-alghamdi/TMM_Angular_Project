import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { HomepageComponent } from './homepage/homepage.component';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { FormsModule } from '@angular/forms';
import { ActiveJobRequestComponent } from './active-job-request/active-job-request.component';

@NgModule({
  declarations: [
    HomepageComponent,
    AddEmployeeComponent,
    ActiveJobRequestComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,

    // forms module lets admin forms update their component fields
    FormsModule,
  ]
})
export class AdminModule {}
