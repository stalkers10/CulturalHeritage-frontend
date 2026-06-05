import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../components/header/header.component';
import { AdminExplorePageRoutingModule } from './admin-explore-routing.module';
import { AdminExplorePage } from './admin-explore.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    AdminExplorePageRoutingModule,
    HeaderComponent
  ],
  declarations: [AdminExplorePage]
})
export class AdminExplorePageModule {}
