import { Component, OnInit } from '@angular/core';
import { IonToolbar, IonItemDivider, IonLabel, IonAvatar } from "@ionic/angular/standalone";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [IonAvatar, IonToolbar, IonItemDivider, IonLabel],
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

}
