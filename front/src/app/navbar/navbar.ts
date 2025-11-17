import { Component,  inject, OnInit } from '@angular/core';
import { AuthService } from '../auth.service/auth.service';
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../services/notificacion-service.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

 auth = inject(AuthService);
  router = inject(Router);

  constructor() {}

  ngOnInit() {
    // Ya no necesitas cargar notificaciones aquí
  }

  logout() {
    if (confirm("Desea cerrar sesión?")) {
      this.auth.logout();
      this.router.navigateByUrl('/');
    }
  }
}
