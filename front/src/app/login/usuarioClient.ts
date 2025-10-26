import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Usuario } from "./usuario";

@Injectable({
    providedIn: 'root'
})
export class UsuarioClient {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = '';

    getUsuarios(){
        
    }

    getUsuarioById(){

    }

    addUsuario(){

    }

    updateUsuario(){

    }

    deleteUsuario(){
        
    }
}