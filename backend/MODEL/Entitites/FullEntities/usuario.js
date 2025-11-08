 class Usuario {
    //Campos Objeto 
    idUsuario;
    nombreUsuario;
    email;
    contrasenia; //Propiedad privada 
    estadoAdmin; //Propiedad privada
    /**  @type {Turno[]} */
    turnosUsuario;
    usuarioPremium;

    //Constructor
    constructor(email, nombreUsuario, contrasenia, usuarioPremium) {
        //El id hay que autogenerarlo y autoincrementarlo en alguna funcion
        this.email = email;
        this.nombreUsuario = nombreUsuario;
        this.contrasenia = contrasenia; //Propiedad privada
        this.estadoAdmin = false;
        this.turnosUsuario = [];
        this.usuarioPremium = false;
    }

    //Getters
    get getIdUsuario() {
        return this.idUsuario;
    }
    get getEmail() {
        return this.email;
    }
    get getNombreUsuario() {
        return this.nombreUsuario;
    }
    get getContrasenia() {
        return this.contrasenia; //Propiedad privada
    }
    get getEstadoAdmin() {
        return this.estadoAdmin; //Propiedad privada
    }
    get getTurnosUsuario(){
        return this.turnosUsuario;
    }
    get getUsuarioPremium(){
        return this.usuarioPremium;
    }

    //Setters
    set setidUsuario(idUsuario) {
        this.idUsuario = idUsuario;
    }
    set setEmail(email) {
        this.email = email;
    }
    set setNombreUsuario(nombre) {
        this.nombreUsuario = nombre;
    }
    set setContrasenia(contrasenia) {
        this.contrasenia = contrasenia; //Propiedad privada
    }
    set setEstadoAdmin(estadoAdmin) {
        this.estadoAdmin = estadoAdmin; //Propiedad privada
    }
    set setTurnosUsuario(arrayTurnos){
        this.turnosUsuario = arrayTurnos;
    }

    set setUsuarioPremium(booleano){
        this.usuarioPremium = booleano;
    }
}

// Exportación compatible con CommonJS
module.exports = { Usuario };