export class Turno {
//Campos Objeto
    static idUltimoTurno = 0;
    idTurno;
    idCliente;
    fecha;
    hora;
    turnoDisponible;
    tipoServicio;
    notas;


    //Constructor 
    constructor(fecha, hora, idCliente, tipoServicio, notas) {
        Turno.idUltimoTurno += 1; //Aumentamos ID ultimo turno

        this.idTurno = Turno.idUltimoTurno;
        this.idCliente = idCliente;
        this.fecha = fecha;
        this.hora = hora;
        // this.turnoDisponible = false; //Hay que checkearlo esto como se maneja
        this.tipoServicio = tipoServicio;
        this.notas = notas;
    }

    //Getters

    get getIdTurno(){
        return this.idTurno;
    }

    get getIdCliente(){
        return this.idCliente;
    }

    get getFecha(){
        return this.fecha;
    }

    get getHora(){
        return this.hora;
    }

    get getServicio(){
        return this.tipoServicio;
    }
    get getNotas(){
        return this.notas;
    }

    //Setters
    set setIdTurno(idTurno){
        this.idTurno = idTurno;
    }
    set setIdCliente(idCliente){
        this.idCliente = idCliente;
    }
    set setFecha(fecha){
        this.fecha = fecha;
    }
    set setHora(hora){
        this.hora = hora;
    }
    set setTipoServicio(tipoServicio){
        this.tipoServicio = tipoServicio;
    }
    set setNotas(notas){
        this.notas = notas;
    }

    


}