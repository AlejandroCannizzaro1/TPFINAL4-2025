import { Injectable } from '@angular/core';
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

  constructor(private http: HttpClient) { }


  getTurnos() {
    return this.http.get<TurnosResponse[]>(this.apiUrl + '/turnos');
  }

  getTurnosDisponibles() {
    return this.http.get<Turno[]>(this.apiUrl + '/turnos/disponibles');
  }

  getTurnosById(id: string | number) {  //Turnos de un usuario
    return this.http.get<TurnosByUsuarioResponse>(`${this.apiUrl}/turnos/usuario?idUsuario=${id}`);
  }


  crearTurnoAdmin(idAdmin: number, datosTurno: Partial<Turno>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/turnos/admin`, { idAdmin, datosTurno });
  }

  reservarTurno(idTurno: number, data: { idUsuario: number, tipoServicio: string, notas: string }): Observable<any> {
    return this.http.put<Turno>(`${this.apiUrl}/turnos/reservar/${idTurno}`, data);
  }

  eliminarTurno(idTurno: number, idAdmin: number) {
    return this.http.post<any>(`${this.apiUrl}/turnos/eliminar/${idTurno}`, { "idUsuarioAdmin":idAdmin});
  }

  cancelarReservaTurno(idTurno: number, idUsuario: number) {
    return this.http.post<any>(`${this.apiUrl}/turnos/cancelar/${idTurno}`, { "idUsuarioAdmin":idUsuario});
  }
}
