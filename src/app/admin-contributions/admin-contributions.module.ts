import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../components/header/header.component';
import { AdminContributionsPageRoutingModule } from './admin-contributions-routing.module';
import { AdminContributionsPage } from './admin-contributions.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    AdminContributionsPageRoutingModule,
    HeaderComponent
  ],
  declarations: [AdminContributionsPage]
})
export class AdminContributionsPageModule {}