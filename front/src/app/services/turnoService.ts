import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Turno } from '../entities/turno';
import { TurnosByUsuarioResponse } from '../entities/turnosByUsuarioResponse';
import { UsuarioResponse } from '../entities/usuarioResponse';
import { TurnosResponse } from '../entities/turnosResponse';

@Injectable({
  providedIn: 'root'
})
export class TurnoService {

  private apiUrl = 'http://localhost:3001'; // asegurate que este puerto sea el correcto

  private readonly http = inject(HttpClient);


  getTurnos() {
    return this.http.get<TurnosResponse[]>(this.apiUrl + '/turnos');
  }

  getTurnosDisponibles() {
    return this.http.get<Turno[]>(this.apiUrl + '/turnos/disponibles');
  }

  getTurnosById(idTurno: string | number) {
    return this.http.get<Turno>(`${this.apiUrl}/turnos/${idTurno}`);
  }

  reservarTurno(idTurno: number, idUsuario: number): Observable<any> {
    return this.http.post<Turno>(`${this.apiUrl}/turnos/reservar/${idTurno}`, { "idUsuario": idUsuario });
  }

  //rep a
  eliminarTurno(idTurno: number, idAdmin: number) {
    return this.http.post<any>(`${this.apiUrl}/turnos/eliminar/${idTurno}`, { "idUsuarioAdmin": idAdmin });
  }

  //rep b
  cancelarReservaTurno(idTurno: number, idUsuario: number) {
    return this.http.post<any>(`${this.apiUrl}/turnos/cancelar/${idTurno}`, { "idUsuario": idUsuario });
  }

  getTurnosByIdUsuario(idUsuario: string | number) {
    return this.http.get<TurnosByUsuarioResponse>(`${this.apiUrl}/turnos/usuario?idUsuario=${idUsuario}`);
  }

  crearTurnoAdmin(idAdmin: number, datosTurno: Partial<Turno>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/turnos/admin`, { idAdmin, datosTurno });
  }

  //rep b
  cancelarReserva(idTurno: number, idUsuario: number) {
    return this.http.post(`${this.apiUrl}/turnos/cancelar/${idTurno}`, { idUsuario });
  }

  //rep a
  eliminarTurnoAdmin(idTurno: number, idUsuarioAdmin: number) {
    return this.http.post(`${this.apiUrl}/turnos/eliminar/${idTurno}`, { idUsuarioAdmin });
  }

  limpiarTurnosPasados(idUsuarioAdmin: number) {
    return this.http.post(`${this.apiUrl}/turnos/limpiar`, { idUsuarioAdmin });
  }

  editarTurnoAdmin(idTurno: number, idUsuarioAdmin: number, cambios: Partial<Turno>) {
    return this.http.patch(`${this.apiUrl}/turnos/${idTurno}`, { idUsuarioAdmin, ...cambios });
  }

}
