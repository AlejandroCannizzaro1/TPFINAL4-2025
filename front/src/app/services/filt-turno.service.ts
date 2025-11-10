import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Usuario } from "../entities/usuario";
import {TurnoService} from "../services/turnoService";


@Injectable({
  providedIn: 'root'
})
export class FiltTurnoService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:3001/turnos';



  constructor() { }
}
