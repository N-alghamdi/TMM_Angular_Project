import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { CreateJobRequestComponent } from './create-job-request/create-job-request.component';
import { ClientGuard } from '../authentication/client.guard';
import { TrackJobRequestsComponent } from './track-job-requests/track-job-requests.component';

const routes: Routes = [
  // these guarded routes require a signed in client session
  {
    path: 'client/homepage',
    component: HomepageComponent,
    canActivate: [ClientGuard]
  },
  {
    path: 'client/homepage/createJobRequest',
    component: CreateJobRequestComponent,
    canActivate: [ClientGuard]
  },
  {
    path: 'client/homepage/trackJobRequests',
    component: TrackJobRequestsComponent,
    canActivate: [ClientGuard]
  },

  // these extra entries keep page titles beside their matching paths
  {
    path: "client/homepage",
    component: HomepageComponent,
    title: "Home Page"
  },
  {
    path: "client/homepage/createJobRequest",
    component: CreateJobRequestComponent,
    title: "Create Job Request"
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule {}
