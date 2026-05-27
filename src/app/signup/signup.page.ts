import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone:false
})
export class SignupPage implements OnInit {
  signupData = {
    fullName: '',
    email: '',
    password: '',
    agreeTerms: false
  };
  showPassword = false;

  constructor(private router: Router, private apiService: ApiService) { }

  ngOnInit() {
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignup() {
    console.log('Signup attempt:', this.signupData);
    
    this.apiService.signup(this.signupData).subscribe({
      next: (response) => {
        console.log('Signup successful:', response);
        alert('Welcome to the Heritage! Your account has been created.');
        this.router.navigate(['/tabs/tab1']);
      },
      error: (err) => {
        console.error('Signup failed:', err);
        alert(err.error?.message || 'Registration failed. Please check your connection.');
      }
    });
  }

  onSocialSignup(platform: string) {
    console.log(`Social signup with ${platform}`);
  }
}
