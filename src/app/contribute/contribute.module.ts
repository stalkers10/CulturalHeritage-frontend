import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContributePage } from './contribute.page';


import { ContributePageRoutingModule } from './contribute-routing.module';
import { HeaderComponent } from "../components/header/header.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContributePageRoutingModule,
    HeaderComponent
],
  declarations: [ContributePage]
})
export class ContributePageModule {}
