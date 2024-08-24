import { Component, OnInit } from '@angular/core';
import { User } from '../model/user';
import { LoginService } from '../login/login.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  
  user: User = {};

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

  isAdmin(user: User): boolean {
    if (user.role === 'ADMIN') {
      return true;
    } else {
      return false;
    }
  }
}
