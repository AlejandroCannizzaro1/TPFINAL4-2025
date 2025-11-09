import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Turno } from "../entities/turno";

@Injectable({
  providedIn: 'root'
})
export class TurnoClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3001/turnos';

  getTurnos() {
    return this.http.get<Turno[]>(this.baseUrl);
  }

  getTurnoById(idTurno: number) {
    return this.http.get<Turno>(`${this.baseUrl}/${idTurno}`);
  }

  crearTurno(turno: Partial<Turno>) {
    return this.http.post<any>(this.baseUrl, turno);
  }

  reservarTurno(idTurno: number, idUsuario: number) {
    return this.http.post(`${this.baseUrl}/reservar/${idTurno}`, { idUsuario });
  }

  cancelarTurno(idTurno: number, idUsuario: number) {
    return this.http.post(`${this.baseUrl}/cancelar/${idTurno}`, { idUsuario });
  }

  getTurnosByIdCliente(idUsuario: number){
    return this.http.get<Turno[]>(`${this.baseUrl}/usuario?idUsuario=${idUsuario}`);
  }

  getTurnosDisponibles() {
  return this.http.get<Turno[]>('/turnos/disponibles');
}
}
