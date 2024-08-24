import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login/login.service';
import { User } from '../model/user';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  user: User= {};
  connectedUser: User = {};

  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    
    if (Object.keys(this.user).length == 0) {
      this.loginService.getUserDetails().subscribe((userData) => {
        this.user.email = userData.email;
        this.user.role = userData.role;
      });
    }
    this.user.email = this.loginService.userConnected.email;
    this.user.role = this.loginService.userConnected.role;
  }

  isAdmin(user: User) : boolean {

    if (user.role === "ADMIN") {
      return true;
    }
    else {
      return false;
    }
  }

}
