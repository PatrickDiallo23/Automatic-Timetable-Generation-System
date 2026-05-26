import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let modifiedRequest = request;

    // 1. Ensure HTTPS is used
    if (modifiedRequest.url.startsWith('http://') && environment.forceHttps) {
      modifiedRequest = modifiedRequest.clone({
        url: modifiedRequest.url.replace('http://', 'https://'),
      });
    }

    // 2. Add authorization header with jwt token if available
    let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser && currentUser.access_token) {
      modifiedRequest = modifiedRequest.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.access_token}`,
        },
      });
    }

    return next.handle(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // If 401 on a non-auth endpoint, clear stale session and redirect to login
        if (error.status === 401 && !modifiedRequest.url.includes('/api/v1/auth')) {
          localStorage.removeItem('currentUser');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
