class Notificacion {

  idNotificacion;
  mensajeNotificacion;
  mensajeLeido;

  /** @type {string[]} */ 
  idTurnoVinculado;

  /** @type {string[]} */
  idUsuarioVinculado;

  constructor(mensajeNotificacion, turnoAirtableId, usuarioAirtableId) {
    this.mensajeNotificacion = mensajeNotificacion;
    this.idTurnoVinculado = turnoAirtableId ? [turnoAirtableId] : []; // Airtable espera array
    this.idUsuarioVinculado = usuarioAirtableId ? [usuarioAirtableId] : [];
    this.mensajeLeido = false;
    this.idNotificacion = Date.now(); // Autogenerado
  }

  // Getters
  get getIdNotificacion() { return this.idNotificacion; }
  get getMensajeNotificacion() { return this.mensajeNotificacion; }
  get getMensajeLeido() { return this.mensajeLeido; }
  get getIdTurnoVinculado() { return this.idTurnoVinculado; }
  get getIdUsuarioVinculado() { return this.idUsuarioVinculado; }

  // Setters
  set setMensajeNotificacion(mensaje) { this.mensajeNotificacion = mensaje; }
  set setMensajeLeido(leido) { this.mensajeLeido = leido; }
  set setIdTurnoVinculado(turnoID) { this.idTurnoVinculado = [turnoID]; }
  set setIdUsuarioVinculado(usuarioID) { this.idUsuarioVinculado = [usuarioID]; }
}

module.exports = { Notificacion };
