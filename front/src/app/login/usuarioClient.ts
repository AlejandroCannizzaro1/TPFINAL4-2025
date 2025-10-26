import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Usuario } from "./usuario";

@Injectable({
    providedIn: 'root'
})
export class UsuarioClient {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:3000/usuarios';

    getUsuarios(){
        return this.http.get<Usuario[]>(this.baseUrl);
    }

    getUsuarioById(id: string | number){
        return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
    }

    addUsuario(usuario: Usuario){
        return this.http.post<Usuario>(this.baseUrl, usuario);
    }

    updateUsuario(usuario: Usuario, id: string | number){
        return this.http.patch<Usuario>(`${this.baseUrl}/${id}`, usuario);
    }

    deleteUsuario(id: string | number){
        return this.http.delete(`${this.baseUrl}/${id}`);
    }
}