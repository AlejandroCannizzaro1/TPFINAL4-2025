import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Usuario } from "../entities/usuario";

@Injectable({
  providedIn: 'root'
})
export class UsuarioClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3001/usuarios'; // <-- CAMBIADO (3001)

  getUsuarios() {
    return this.http.get<Usuario[]>(this.baseUrl);
  }

  getUsuarioById(idUsuario: number) {
    return this.http.get<Usuario>(`${this.baseUrl}/${idUsuario}`); // <-- idUsuario
  }

  addUsuario(usuario: Usuario) {
    return this.http.post<Usuario>(this.baseUrl, usuario);
  }

  updateUsuario(idUsuario: number, cambios: Partial<Usuario>) {
    return this.http.patch<Usuario>(`${this.baseUrl}/${idUsuario}`, cambios); // <-- patch correcto
  }

  deleteUsuario(idUsuario: number) {
    return this.http.delete(`${this.baseUrl}/${idUsuario}`);
  }
}
