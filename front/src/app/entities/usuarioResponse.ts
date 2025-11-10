export interface UsuarioResponse {
  id: string;
  createdTime: string;
  fields: {
    idUsuario: number;
    nombreUsuario: string;
    email: string;
    contrasenia: string;
    estadoAdmin?: boolean;     // aparece solo en algunos
    Turnos?: string[];         // aparece solo en algunos
  };
}
