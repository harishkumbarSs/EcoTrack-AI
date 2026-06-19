import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let message = 'An unexpected error occurred';

        if (error.status === 0) {
          message = 'Cannot connect to server. Please check your connection.';
        } else if (error.status === 400) {
          message = error.error?.error || 'Bad request';
        } else if (error.status === 404) {
          message = 'Resource not found';
        } else if (error.status === 422) {
          message = error.error?.error || 'Validation failed';
        } else if (error.status === 429) {
          message = 'Too many requests. Please slow down.';
        } else if (error.status >= 500) {
          message = 'Server error. Please try again later.';
        }

        return throwError(() => ({ ...error, userMessage: message }));
      })
    );
  }
}
