import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { Observable } from 'rxjs'; // Import Observable for HTTP calls
import { User } from '../interfaces/user'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/auth/login'; 

  constructor(private http: HttpClient) {}

  login(user: User): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }
}
