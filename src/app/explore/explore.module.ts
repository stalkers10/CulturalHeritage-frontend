import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExplorePage } from './explore.page';


import { ExplorePageRoutingModule } from './explore-routing.module';
import { HeaderComponent } from '../components/header/header.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExplorePageRoutingModule,
    HeaderComponent
  ],
  declarations: [ExplorePage]
})
export class ExplorePageModule {}
