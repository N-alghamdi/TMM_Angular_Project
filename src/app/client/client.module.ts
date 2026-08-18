import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientRoutingModule } from './client-routing.module';
import { HomepageComponent } from './homepage/homepage.component';
import { CreateJobRequestComponent } from './create-job-request/create-job-request.component';
import { FormsModule } from '@angular/forms';
import { TrackJobRequestsComponent } from './track-job-requests/track-job-requests.component';

@NgModule({
  declarations: [
    HomepageComponent,
    CreateJobRequestComponent,
    TrackJobRequestsComponent
  ],
  imports: [
    CommonModule,
    ClientRoutingModule,

    // forms module supports the two way bindings used by the request form
    FormsModule,
  ]
})
export class ClientModule {}
