import { Component, inject, signal, OnInit } from '@angular/core';
import { AuthService } from '../../../auth.service/auth.service';
import { NotificacionService } from '../../../services/notificacion-service.service';
import { Notificacion } from '../../../entities/notificacion';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notificaciones-users',
  imports: [CommonModule],
  templateUrl: './notificaciones-users.component.html',
  styleUrl: './notificaciones-users.component.css'
})
export class NotificacionesUsersComponent {
  auth = inject(AuthService);
  notiService = inject(NotificacionService);
  cargando = signal(true);


  notificaciones = signal<Notificacion[]>([]);
  notificacionSeleccionada = signal<Notificacion | null>(null);

  ngOnInit() {
    this.cargarNotificaciones();
  }


  cargarNotificaciones() {
    if (!this.auth.isAdmin()) return;

    const idUsuario = Number(this.auth.getId());
    if (!idUsuario) return;

    this.cargando.set(true);

    this.notiService.getNotificacionesByUsuario(idUsuario).subscribe({
      next: (data) => {
        this.notificaciones.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar notificaciones:', err);
        this.cargando.set(false);
      }
    });
  }

  seleccionarNotificacion(noti: Notificacion) {
    if (this.notificacionSeleccionada() === noti) {
      this.notificacionSeleccionada.set(null);  // cerrar/deseleccionar
    } else {
      this.notificacionSeleccionada.set(noti);
    }
  }
}
