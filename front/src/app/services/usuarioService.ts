import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Usuario } from "../entities/usuario";
import { UsuarioResponse } from '../entities/usuarioResponse';
import { map } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3001/usuarios';

  getUsuarios() {
    return this.http.get<UsuarioResponse[]>(this.baseUrl);
  }

  getUsuarioById(idUsuario: number) {
    return this.http.get<Usuario>(`${this.baseUrl}/${idUsuario}`);
  }

  addUsuario(usuario: Usuario) {
    return this.http.post<Usuario>(this.baseUrl, usuario);
  }

  updatePatchUsuario(idUsuario: number, cambios: Partial<Usuario>) {
    return this.http.patch<Usuario>(`${this.baseUrl}/${idUsuario}`, cambios);
  }

  updatePutUsuario(idUsuario: number, cambios: Partial<Usuario>) {
    return this.http.put<Usuario>(`${this.baseUrl}/${idUsuario}`, cambios);
  }

  deleteUsuario(idUsuario: number) {
    return this.http.delete(`${this.baseUrl}/${idUsuario}`);
  }

  //  NUEVO
  login(email: string, contrasenia: string) {
  return this.http.get<any>(`${this.baseUrl}/email?value=${email}`).pipe(
    map(user => {
      if (!user) {
        throw new Error("no_user");
      }
      
      // Asegurate que el nombre del campo coincide con Airtable
      if (user.contrasenia !== contrasenia) {
        throw new Error("bad_password");
      }

      return user; // login ok
    })
  );
}

  checkEmail(email: string) {
  return this.http.get<UsuarioResponse[]>(this.baseUrl).pipe(
    map(users => users.some(u => u.fields.email.toLowerCase() === email.toLowerCase()))
  );
}
  
}

