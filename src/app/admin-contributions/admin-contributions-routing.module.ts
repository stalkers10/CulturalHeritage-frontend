import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminContributionsPage } from './admin-contributions.page';

const routes: Routes = [
  {
    path: '',
    component: AdminContributionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminContributionsPageRoutingModule {}