import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login/login.service';
import { User } from '../model/user';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  user: User = {};
  connectedUser: User = {};
  error: string | null = null;

  constructor(private router: Router, private loginService: LoginService) {}

  ngOnInit(): void {
    this.loginService.setShowSidebar(false);
    if (Object.keys(this.user).length == 0) {
      this.loginService.getUserDetails().subscribe({
        next: (userData) => {
          this.user = {
            email: userData.email,
            role: userData.role,
          };
          // Update the service cache
          this.loginService.setUser({ ...this.user });
        },
        error: (error) => {
          console.error('Error loading user data:', error);
          this.error =
            'Failed to load user information. Please try refreshing the page.';
        },
      });
    }
    this.user = { ...this.loginService.userConnected };
  }

  isAdmin(user: User): boolean {
    return user.role === 'ADMIN';
  }

  // Utility method to get user role display
  getUserRoleDisplay(): string {
    return this.user?.role || 'User';
  }

  // Method to get greeting based on time of day
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  startTimetableGenerationProcess() {
    this.loginService.setShowSidebar(true);
    this.router.navigate(['/rooms']);
  }

  viewTimetableGenerationProcess() {
    this.loginService.setShowSidebar(true);
    this.router.navigate(['/timetable']);
  }
}
