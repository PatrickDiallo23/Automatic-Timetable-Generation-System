import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LoginService } from './login/login.service';
import { User } from './model/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  title = 'timetable-app';
  showSidebar: boolean = false;
  isLogged?: boolean;
  user: User = {};
  connectedUser: User = {};
  @ViewChild('logoutDialog') logoutDialog!: TemplateRef<any>;
  dialogRef!: MatDialogRef<any>;

  constructor(private dialog: MatDialog, private router: Router, private loginService: LoginService) {}

  ngOnInit(): void {
    this.loginService.showSidebar$.subscribe((value) => {
      this.showSidebar = value;
    });

    // If we don't have user already
    if (Object.keys(this.user).length == 0) {

    this.loginService.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        // User is authenticated, show the main content
        // this.showSidebar = true;
        this.loginService.getUserDetails().subscribe((userData) => {
          this.user.email = userData.email;
          this.user.role = userData.role;
          this.loginService.setUser(this.user);
        });

        this.isLogged = true;

      } else {
        // User is not authenticated, show the login component
        // this.showSidebar = false;
        this.isLogged = false;
      }
    });
  } else {
    // if we have user
    this.loginService.isAuthenticated$.subscribe(
    (isAuthenticated) => {
      if (isAuthenticated) {
        this.user.email = this.loginService.userConnected.email;
        this.user.role = this.loginService.userConnected.role;
        this.isLogged = true;
      } else {
        this.isLogged = false;
      }
    }
      );
  }
  }

  startProcess() {
    // console.log(this.showSidebar);
    this.loginService.setShowSidebar(!this.showSidebar);
    if (this.showSidebar == false) {
      this.router.navigate(['/dashboard']);
    } else {
      // Redirect to the Rooms page
      if (this.isAdmin(this.user)) {
      this.router.navigate(['/rooms']);
      }
      else {
        this.router.navigate(['/timetable'])
      }
    }
  }

  isAdmin(user: User): boolean {
    if (user.role === 'ADMIN') {
      return true;
    } else {
      return false;
    }
  }

  logout(): void {
      this.dialogRef = this.dialog.open(this.logoutDialog, {
        width: '300px',
        disableClose: true
      });

      this.dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loginService.logout();
          localStorage.removeItem('currentUser');
          this.loginService.setAuthenticated(false);
          this.loginService.setUser({});
          this.isLogged = false;
          this.router.navigate(['/login']);
        }
      });
    }
}
