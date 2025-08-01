import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from './login.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  email: string = '';
  password: string = '';
  returnUrl: string = '';
  hidePassword: boolean = true;
  isLoading: boolean = false;
  loginError: string = '';

  constructor(private loginService: LoginService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar) {}

  ngOnInit(): void {

    this.loginService.logout();

    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || '/dashboard'; // check if we need it

    // Clear any previous errors
    this.loginError = '';
  }

  login() {
    // Validate form before submission
    if (!this.email || !this.password) {
      this.loginError = 'Please fill in all required fields.';
      return;
    }

    // Start loading state
    this.isLoading = true;
    this.loginError = '';

    this.loginService.login(this.email, this.password).subscribe(
      (response) => {
        // Assuming the backend returns a JWT token on success
        if (response && response.access_token) {
          const token = response.access_token; // the token
          localStorage.setItem('currentUser', JSON.stringify(response));
          this.loginService.setAuthenticated(true);
          this.showSuccessMessage();

          this.router.navigate([this.returnUrl]);
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Login failed', error);

        // Handle different error types
        if (error.status === 401) {
          this.loginError = 'Invalid email or password. Please check your credentials.';
        } else if (error.status === 403) {
          this.loginError = 'Account access denied or incorrect credentials. Please contact administrator.';
        } else if (error.status === 0) {
          this.loginError = 'Unable to connect to server. Please check your internet connection.';
        } else if (error.status >= 500) {
          this.loginError = 'Server error. Please try again later.';
        } else {
          this.loginError = 'Login failed. Please try again.';
        }
      },
      () => {
        // Stop loading state after request completes
        this.isLoading = false;
      }
    );
  }

  private showSuccessMessage(): void {
    this.snackBar.open('Login successful!', 'Close', {
      duration: 3000, // 3 seconds
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-success']
    });
    console.log('Login successful!');
  }

  // Handle forgot password
  onForgotPassword(): void {
    // TODO: Implement forgot password functionality
    console.log('Forgot password clicked');
  }

  // Clear error message when user starts typing
  onEmailChange(): void {
    if (this.loginError) {
      this.loginError = '';
    }
  }

  onPasswordChange(): void {
    if (this.loginError) {
      this.loginError = '';
    }
  }

  onInputChange(): void {
    if (this.loginError) {
      this.loginError = '';
    }
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
