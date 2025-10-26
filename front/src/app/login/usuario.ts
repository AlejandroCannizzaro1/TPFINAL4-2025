export interface Usuario {
    id?: string | number,
    nombre: string,
    email: string,
    contrasenia: string,
    estadoAdmin?: boolean
}