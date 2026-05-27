import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
 
})
export class Tab1Page implements OnInit {
  testData: any;
  
  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getTestData().subscribe({
      next: (data) => {
        this.testData = data;
        console.log('Received data from backend:', data);
      },
      error: (err) => {
        console.error('Error connecting to backend:', err);
      }
    });
  }

}
