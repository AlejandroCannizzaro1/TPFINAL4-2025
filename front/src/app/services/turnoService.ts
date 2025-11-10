import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Turno } from '../entities/turno';

@Injectable({
  providedIn: 'root'
})
export class TurnoService {

  private apiUrl = 'http://localhost:3001'; // asegurate que este puerto sea el correcto

  constructor(private http: HttpClient) { }

 getTurnosDisponibles() {
  return this.http.get<Turno[]>(this.apiUrl + '/turnos/disponibles');
}


  crearTurno(turno: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/turnos/crear`, turno);
  }

  reservarTurno(idTurno: number, data: { idUsuario: number, tipoServicio: string, notas: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/turnos/reservar/${idTurno}`, data);
  }
}
