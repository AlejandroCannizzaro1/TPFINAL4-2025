import { Turno } from "./turno";

export interface TurnosByUsuarioResponse {
    idUsuario: string,
    cantidad: number,
    turnos: Turno[]
}