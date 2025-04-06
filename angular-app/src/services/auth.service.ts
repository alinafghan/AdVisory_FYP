import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { Observable, Subject } from 'rxjs'; // Import Observable for HTTP calls
import { User } from '../interfaces/user'; 
declare var FB: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth/login'; 
  private fbLoginUrl = 'http://localhost:3000/auth/fblogin';

  constructor(private http: HttpClient) {}

  login(user: User): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }

  fblogin(){
      window.location.href = this.fbLoginUrl; // Redirects user to backend for login
    }
}
