export interface Usuario {
  idUsuario?: number;   // <- Cambiado
  nombreUsuario: string;
  email: string;
  contrasenia: string;
  estadoAdmin: boolean;
  usuarioPremium?: boolean;      // <- Agregado
  turnosUsuario?: any[];        // <- Solo si querés recibir turnos embebidos
}