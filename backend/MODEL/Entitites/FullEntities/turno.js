class Turno {

  idTurno;
  idUsuarioVinculado;
  fecha;
  hora;
  turnoDisponible;
  tipoServicio;
  notas;

  constructor(fecha, hora, tipoServicio = '', notas = '') {
    this.fecha = fecha;
    this.hora = hora;
    this.tipoServicio = tipoServicio;
    this.notas = notas;
    this.turnoDisponible = true;
    this.idUsuarioVinculado = []; // turno sin cliente inicialmente
  }

  // Getters
  get getIdTurno() { return this.idTurno; }
  get getIdUsuarioVinculado() { return this.idUsuarioVinculado; }
  get getFecha() { return this.fecha; }
  get getHora() { return this.hora; }
  get getTipoServicio() { return this.tipoServicio; }
  get getNotas() { return this.notas; }
  get getTurnoDisponible() { return this.turnoDisponible; }

  // Setters
  set setIdTurno(idTurno) { this.idTurno = idTurno; }
  set setIdUsuarioVinculado(idUsuario) { this.idUsuarioVinculado = idUsuario; }
  set setFecha(fecha) { this.fecha = fecha; }
  set setHora(hora) { this.hora = hora; }
  set setTipoServicio(tipoServicio) { this.tipoServicio = tipoServicio; }
  set setNotas(notas) { this.notas = notas; }
  set setTurnoDisponible(estado) { this.turnoDisponible = estado; }
}

module.exports = { Turno };
