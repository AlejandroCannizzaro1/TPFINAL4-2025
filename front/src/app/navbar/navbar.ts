import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth.service/auth.service';
import { Router, RouterLink } from "@angular/router";


@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  
  constructor(public auth: AuthService, private router: Router) {}



  logout() {
    if(confirm("Desea cerrar sesion?")) {
      this.auth.logout();
      this.router.navigateByUrl('/');
    }
  }
}
