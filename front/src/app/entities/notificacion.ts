export interface Notificacion {
  idNotificacion: number;
  mensaje: string;
  mensajeLeido?: boolean;
  usuarioVinculado?: string | null; // viene recId o null
}