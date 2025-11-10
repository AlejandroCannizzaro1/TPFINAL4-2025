import { inject, Injectable } from '@angular/core';
import { UsuarioService } from './usuarioService';
import { map } from 'rxjs';
import { Usuario } from '../entities/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioFilterService {

  private readonly usuarioClient = inject(UsuarioService);

  getUsuariosNormalizados() {
    return this.usuarioClient.getUsuarios().pipe(
      map((usuarios: any[]) =>
        usuarios.map(u => ({
          idUsuario: u.fields?.idUsuario ?? null,
          nombreUsuario: u.fields?.nombreUsuario?.trim(),
          email: u.fields?.email?.toLowerCase().trim(),
          contrasenia: u.fields?.contrasenia,
          estadoAdmin: u.fields?.estadoAdmin ?? false,
          usuarioPremium: u.fields?.usuarioPremium ?? false,
          turnosUsuario: u.fields?.Turnos ?? []
        } as Usuario)
        )
      )
    );
  }
}
