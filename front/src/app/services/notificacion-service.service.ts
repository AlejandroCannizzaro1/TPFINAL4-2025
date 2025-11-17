import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Notificacion } from "../entities/notificacion";

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3001/notificaciones';

  // Obtener notificaciones de un usuario
  getNotificacionesByUsuario(idUsuario: number) {
    return this.http.get<Notificacion[]>(
      `${this.baseUrl}/usuario?idUsuario=${idUsuario}`
    );
  }

  // Obtener notificaciones asociadas a un turno (solo admins)
  getNotificacionesByTurno(idTurno: number) {
    return this.http.get<Notificacion[]>(
      `${this.baseUrl}/turno?idTurno=${idTurno}`
    );
  }


}
