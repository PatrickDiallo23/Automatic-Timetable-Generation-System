import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor() {}

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

    return next.handle(modifiedRequest);
  }
}
