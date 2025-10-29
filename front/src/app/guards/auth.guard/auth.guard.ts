import { Component, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../auth.service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router){}

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot): MaybeAsync<GuardResult> {
      
      if(this.authService.isLoggedIn()){
        return true;
      }
      else {
        this.router.navigate(['/']);
        return false;
      }

  }

}
