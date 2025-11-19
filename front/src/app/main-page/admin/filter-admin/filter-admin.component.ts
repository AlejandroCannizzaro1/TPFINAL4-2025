import { Router } from '@angular/router';
import { UsuarioService } from '../../../services/usuarioService';
import { TurnoService } from '../../../services/turnoService';
import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewChild, ElementRef, effect } from '@angular/core';


@Component({
  selector: 'app-filter-admin',
  standalone: true, // si usas standalone
  imports: [CommonModule], // IMPORTANTE para ngFor, ngIf, etc
  templateUrl: './filter-admin.component.html',
  styleUrls: ['./filter-admin.component.css']
})
export class FilterAdminComponent {
  @ViewChild('detalleUsuarioRef') detalleUsuarioRef!: ElementRef;
  
  private usuarioService = inject(UsuarioService);
  private turnoService = inject(TurnoService);
  private readonly router = inject(Router);


  usuarios = signal<any[]>([]);
  turnosUsuario = signal<any[]>([]);
  usuarioSeleccionado = signal<any | null>(null);

  constructor() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios: any[]) => {
        console.log("RAW USUARIOS DESDE AIRTABLE:", JSON.stringify(usuarios, null, 2));
        const lista = usuarios.map(u => ({
          idAirtable: u.id,                  // lo guardamos por si algún día lo necesitás
          idUsuario: u.fields.idUsuario,     // ESTE es el que usa el backend
          nombre: u.fields.nombreUsuario,
          email: u.fields.email
        }));

        console.log("Usuarios Normalizados:", lista);
        this.usuarios.set(lista);
      },
      error: (error) => console.error(error)
    });
  }


  verInfoUsuario(usuario: any) {
    this.usuarioSeleccionado.set(usuario);

    this.turnoService.getTurnosByIdUsuario(usuario.idUsuario).subscribe({
      next: (respuesta) => {
        this.turnosUsuario.set(respuesta.turnos || []);

        setTimeout(() => {
          if (this.detalleUsuarioRef) {
            this.detalleUsuarioRef.nativeElement.scrollIntoView({
              behavior: 'smooth'
            });
          }
        }, 50);
      },
      error: (err) => {
        console.error('Error al obtener turnos', err);
        this.turnosUsuario.set([]);
      }
    });
  }

  navegarAdetalles(idTurno: string | number) {
    this.router.navigate(['/admin/turno', idTurno]);
  }

  // verTurnosUsuario(idUsuario: number) {
  //   this.usuarioSeleccionado.set(
  //     this.usuarios().find(u => u.idUsuario === idUsuario) || null
  //   );

  //   console.log("Buscando usuario con ID:", idUsuario);
  //   console.log("Usuarios:", this.usuarios());

  //   this.turnoService.getTurnosByIdUsuario(idUsuario).subscribe({
  //     next: (turnosResponse) => {
  //       console.log("Turnos recibidos:", turnosResponse);
  //       this.turnosUsuario.set(turnosResponse.turnos || []);
  //     },
  //     error: (err) => {
  //       console.error('Error al obtener turnos', err);
  //       this.turnosUsuario.set([]);
  //     },
  //   });
  //}

}