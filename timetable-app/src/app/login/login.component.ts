import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  email: string = '';
  password: string = '';
  returnUrl: string = '';

  constructor(private loginService: LoginService, private router: Router, private route: ActivatedRoute) {}
  
  ngOnInit(): void {

    this.loginService.logout();

    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || '/dashboard'; // vedem daca vom avea nevoie
  }

  login() {
    this.loginService.login(this.email, this.password).subscribe(
      (response) => {
        // Assuming the backend returns a JWT token on success
        if (response && response.access_token) {
          const token = response.access_token; //the token
          localStorage.setItem('currentUser', JSON.stringify(response));
          this.loginService.setAuthenticated(true);
          this.router.navigate([this.returnUrl]);
        }
      },
      (error) => {
        console.error('Login failed', error);
      }
    );
  }
}
