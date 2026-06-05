import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../components/header/header.component';
import { SubmissionsPageRoutingModule } from './submissions-routing.module';
import { SubmissionsPage } from './submissions.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    SubmissionsPageRoutingModule,
    HeaderComponent
  ],
  declarations: [SubmissionsPage]
})
export class SubmissionsPageModule {}
