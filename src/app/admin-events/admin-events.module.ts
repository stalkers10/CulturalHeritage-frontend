import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../components/header/header.component';
import { AdminEventsPageRoutingModule } from './admin-events-routing.module';
import { AdminEventsPage } from './admin-events.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    AdminEventsPageRoutingModule,
    HeaderComponent
  ],
  declarations: [AdminEventsPage]
})
export class AdminEventsPageModule {}
