export interface Usuario {
    id?: string | number,
    nombreUsuario: string,
    email: string,
    contrasenia: string,
    estadoAdmin: boolean
}