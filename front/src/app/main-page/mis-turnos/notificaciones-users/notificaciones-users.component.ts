import { Component, inject, signal, OnInit, linkedSignal, effect } from '@angular/core';
import { AuthService } from '../../../auth.service/auth.service';
import { NotificacionService } from '../../../services/notificacion-service.service';
import { Notificacion } from '../../../entities/notificacion';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-notificaciones-users',
  imports: [CommonModule],
  templateUrl: './notificaciones-users.component.html',
  styleUrl: './notificaciones-users.component.css'
})
export class NotificacionesUsersComponent {
  private readonly auth = inject(AuthService);
  private readonly notiService = inject(NotificacionService);
  protected readonly cargando = signal(true);
  private readonly idUsuario = Number(this.auth.getId());

  private readonly notificacionesSource = toSignal(this.notiService.getNotificacionesByUsuario(this.idUsuario));
  protected readonly notificaciones = linkedSignal(() => {
    if(this.notificacionesSource()){
      const lista = this.notificacionesSource(); 
      return [...lista!].sort((a,b) => b.idNotificacion - a.idNotificacion);
    }
    return null;
  });
  protected readonly notificacionSeleccionada = signal<Notificacion | null>(null);

  constructor() {
    effect(() => {
      if(this.notificaciones()){
        this.cargando.set(false);
      }
    })
  }

  seleccionarNotificacion(noti: Notificacion) {
    if (this.notificacionSeleccionada() === noti) {
      this.notificacionSeleccionada.set(null);  // cerrar/deseleccionar
    } else {
      this.notificacionSeleccionada.set(noti);
    }
  }
}
