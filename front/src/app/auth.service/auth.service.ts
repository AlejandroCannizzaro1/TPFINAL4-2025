import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey = 'authToken';
  private userRole = 'userRole';
  private userName = 'userName';

  constructor(private router: Router){}


  login(token: string, roleStatus: string, name: string): void{
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userRole, roleStatus)
    localStorage.setItem(this.userName, name);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userRole);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAdmin(): boolean {
    if(localStorage.getItem(this.userRole) == "admin"){
      return true;
    }
    else return false;
  }

  getName(): string | null {
    return localStorage.getItem(this.userName);
  }

}
