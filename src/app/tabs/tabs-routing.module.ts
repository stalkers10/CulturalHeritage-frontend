import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { adminGuard } from '../services/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'explore',
        loadChildren: () => import('../explore/explore.module').then(m => m.ExplorePageModule)
      },
      {
        path: 'contribute',
        loadChildren: () => import('../contribute/contribute.module').then(m => m.ContributePageModule)
      },
      {
        path: 'submissions',
        loadChildren: () => import('../submissions/submissions.module').then(m => m.SubmissionsPageModule)
      },
      {
        path: 'events',
        loadChildren: () => import('../events/events.module').then(m => m.EventsPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'admin/contributions',
        canActivate: [adminGuard],
        loadChildren: () => import('../admin-contributions/admin-contributions.module').then(m => m.AdminContributionsPageModule)
      },
      {
        path: 'admin/explore',
        canActivate: [adminGuard],
        loadChildren: () => import('../admin-explore/admin-explore.module').then(m => m.AdminExplorePageModule)
      },
      {
        path: 'admin/events',
        canActivate: [adminGuard],
        loadChildren: () => import('../admin-events/admin-events.module').then(m => m.AdminEventsPageModule)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
