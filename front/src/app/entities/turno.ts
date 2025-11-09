export interface Turno {
  idTurno: number;
  idUsuarioVinculado: number | null;
  fecha: string;   // Se mantiene como string
  hora: string;    // Se mantiene como string
  turnoDisponible: boolean;
  tipoServicio: string;
  notas: string;
}