 export class Usuario{
//Campos Objeto 
    static idUltimo = 0;
    nombreUsuario;
    email;
    #contrasenia; //Propiedad privada 
     #estadoAdmin; //Propiedad privada

     //Constructor
    constructor(email, nombreUsuario, contrasenia){
        //El id hay que autogenerarlo y autoincrementarlo en alguna funcion
        Usuario.idUltimo +=1; //Autoincrementa el ID
        this.id = Usuario.idUltimo;
        this.email = email;
        this.nombreUsuario = nombreUsuario;
        this.#contrasenia = contrasenia; //Propiedad privada
        this.#estadoAdmin = false;
    }

//Getters
    get getEmail(){
        return this.email;
    }
    get getNombreUsuario(){
        return this.nombreUsuario;
    }
    get getContrasenia(){
        return this.#contrasenia; //Propiedad privada
    }
    get getEstadoAdmin(){
        return this.#estadoAdmin; //Propiedad privada
    }

    //Setters
    set setEmail(email){
        this.email = email;
    }
    set setNombreUsuario(nombre){
        this.nombreUsuario = nombre;
    }
    set setContrasenia(contrasenia){
        this.#contrasenia = contrasenia; //Propiedad privada
    }
    set setEstadoAdmin(estadoAdmin){
        this.#estadoAdmin = estadoAdmin; //Propiedad privada
    }


}