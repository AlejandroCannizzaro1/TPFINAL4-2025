import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey = 'authToken';
  private userId = 'userId';
  private userRole = 'userRole';
  private userName = 'userName';

  constructor(private router: Router){}

  login(id: string | number, token: string, roleStatus: string, name: string): void{
    localStorage.setItem(this.userId, id.toString());
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userRole, roleStatus);
    localStorage.setItem(this.userName, name);
  }

  logout(): void {
    localStorage.removeItem(this.userId);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userRole);
    localStorage.removeItem(this.userName);   // <--- antes faltaba esto
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getId() {
    return localStorage.getItem(this.userId);
  }

  isAdmin(): boolean {
    return localStorage.getItem(this.userRole) === "admin";
  }

  getRole(): string | null {        // <--- lo agregamos porque lo usa MainPage
    return localStorage.getItem(this.userRole);
  }

  getName(): string | null {
    return localStorage.getItem(this.userName);
  }

}
