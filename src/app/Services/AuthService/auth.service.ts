import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../enviroment/environment';
//import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/login`
  private tokenKey = 'authorization';
  constructor(private http: HttpClient, private router: Router) { }

  login(username: string, password: string) {
    return this.http.post<{ token: string }>(this.baseUrl, { username, password }).subscribe(
      (response) => {
      localStorage.setItem(this.tokenKey, response.token);
      this.router.navigate(['/dashboard']);
    });
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  }

  getUserData() {
    const token = this.getToken();
    if (!token) return null;
  
    const payload = JSON.parse(atob(token.split('.')[1])); // Decodificar payload
    return payload; // Retorna el objeto con username, role, etc.
  }

  isLoggedIn() {
  return !!this.getToken(); // Comprueba si hay un token
}

hasRole(role: string): boolean {
  return this.getRole() === role;
}
}
