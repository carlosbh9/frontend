import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../enviroments/environment';
//import { environment } from '../../../environment/environment';
import { UserPayload } from '../../interfaces/user.interface';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth/login`
  private tokenKey = 'authorization';
  constructor(private http: HttpClient, private router: Router) { }

  login(username: string, password: string) {
    return this.http.post<{ token: string,tokenPermission: string }>(this.baseUrl, { username, password }).pipe(
      tap((response) => {
        const token = response.token;

        if (token) {
          localStorage.setItem(this.tokenKey, token);

          const payload = JSON.parse(atob(token.split('.')[1]));
          localStorage.setItem('UserData', JSON.stringify(payload));
        } else {
          console.error('Error: Token no encontrado en la respuesta.');
        }

        this.router.navigate(['/dashboard/quoter-main/quoter-list']);
      })
    );
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.clear()
    this.router.navigate(['/login']);
  }

  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  }
  getPermisions(): string[] {
    const token = this.getToken();
    if (!token) return [];

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.permissions;
  }

  getUserData() : UserPayload | null{
    const token = this.getToken();
    if (!token) return null;
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decodificar el payload
      return payload as UserPayload; // Asumir que el payload tiene la estructura de UserPayload
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }

  isLoggedIn() {
  return !!this.getToken(); // Comprueba si hay un token
}

hasRole(role: string): boolean {
  return this.getRole() === role;
}
}
