import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminExplorePage } from './admin-explore.page';

const routes: Routes = [
  {
    path: '',
    component: AdminExplorePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminExplorePageRoutingModule {}