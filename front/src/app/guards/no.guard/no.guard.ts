import { Component, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../auth.service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
      if(this.authService.isLoggedIn()){
        this.router.navigate(['']);
        return false;
      }
      else return true;
  }

}
