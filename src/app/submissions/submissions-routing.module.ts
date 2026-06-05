import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubmissionsPage } from './submissions.page';

const routes: Routes = [
  {
    path: '',
    component: SubmissionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubmissionsPageRoutingModule {}
