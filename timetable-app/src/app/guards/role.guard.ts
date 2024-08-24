import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { LoginService } from '../login/login.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard  {
//Todo: to implement RoleGuard
  constructor(private authGuard: AuthGuard, private loginService: LoginService){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if(!this.loginService.isAuthenticated){
        return false;
      }
      //role guard check code/logic goes here
      return true;
  
  }
  
}

