export interface Turno {
  idTurno?: number;
  idUsuarioVinculado?: number[]; // o number | number[] según cómo lo devuelvas
  fecha: string;       // "YYYY-MM-DD"
  hora: string;       // "HH:MM" (si aún usás este campo)
  horaInicio?: string; // "HH:MM"
  horaFin?: string;    // "HH:MM"
  turnoDisponible: boolean;
  tipoServicio?: string;
  notas?: string;
}