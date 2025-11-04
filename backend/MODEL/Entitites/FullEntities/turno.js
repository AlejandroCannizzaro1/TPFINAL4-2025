 class Turno {
    //Campos Objeto
    static idUltimoTurno = 0;
    idTurno;
    usuarioVinculado;
    fecha;
    hora;
    turnoDisponible;
    tipoServicio; //Esto esta en veremos
    notas; //Esto tambien 

/* La fecha en airtable : 
const fecha = new Date().toISOString(); 
console.log(fecha);
// → "2025-11-02T18:42:15.123Z"
Y eso lo podés enviar así:

js
Copiar código
{
  fields: {
    FechaRegistro: new Date().toISOString()
  }
}*/
    //Constructor turno cuando usuario se vincula al turno 
    // constructor(fecha, hora, idUsuarioVinculado, tipoServicio, notas) {
    //     Turno.idUltimoTurno += 1; //Aumentamos ID ultimo turno

    //     this.idTurno = Turno.idUltimoTurno;
    //     this.idUsuarioVinculado = ;
    //     this.fecha = fecha;
    //     this.hora = hora;
    //     // this.turnoDisponible = false; //Hay que checkearlo esto como se maneja
    //     this.tipoServicio = tipoServicio;
    //     this.notas = notas;
    // }

    //Constructor Turno para ADMIN
      constructor(fecha, hora, tipoServicio, notas) {
        Turno.idUltimoTurno += 1; //Aumentamos ID ultimo turno
        this.idTurno = Turno.idUltimoTurno;
        this.fecha = fecha;
        this.hora = hora;
        this.tipoServicio = tipoServicio;
        this.notas = notas;
        this.turnoDisponible = true;
      
    }

    //Getters

    get getIdTurno() {
        return this.idTurno;
    }

    get getUsuarioVinculado() {
        return this.idCliente;
    }

    get getFecha() {
        return this.fecha;
    }

    get getHora() {
        return this.hora;
    }

    get getTipoServicio() {
        return this.tipoServicio;
    }
    get getNotas() {
        return this.notas;
    }

    get getTurnoDisponible(){
        return this.turnoDisponible;
    }

    get getUsuarioVinculado(){
        return this.idUsuarioVinculado;
    }

    //Setters
    set setIdTurno(idTurno) {
        this.idTurno = idTurno;
    }
    set setIdUsuarioVinculado(idUsuario) {
        this.idUsuarioVinculado = idUsuario;
    }
    set setFecha(fecha) {
        this.fecha = fecha;
    }
    set setHora(hora) {
        this.hora = hora;
    }
    set setTipoServicio(tipoServicio) {
        this.tipoServicio = tipoServicio;
    }

    set setTurnoDisponible(estado){
        this.setTurnoDisponible = estado;
    }
    set setNotas(notas) {
        this.notas = notas;
    }
}

//  Exportación CommonJS
module.exports = { Turno };