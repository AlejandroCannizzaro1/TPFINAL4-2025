import { Component, effect, inject, linkedSignal, signal } from '@angular/core';
import { TurnoService } from '../../services/turnoService';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../auth.service/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-turnos.component.html',
  styleUrls: ['./mis-turnos.component.css']
})
export class MisTurnosComponent {
  
  private readonly auth = inject(AuthService);
  private readonly client = inject(TurnoService);
  private readonly router = inject(Router);

  protected readonly orden = signal<'fecha' | 'hora'>('fecha');

  protected readonly turnosSource = toSignal(this.client.getTurnosByIdUsuario(Number(this.auth.getId()))); 
  protected readonly turnos = linkedSignal(() => this.turnosSource()?.turnos ?? []); 

  verDetalles(id: number) {
    this.router.navigate(['/mis-turnos', id]);
  }

  constructor() {
    effect(() => {
      switch(this.orden()) {
        case 'fecha':
          this.ordenarPorFecha();
          break;
        case 'hora':
          this.ordenarPorHora();
          break;
      }
    });
  }

  cambiarOrden(orden: 'fecha' | 'hora') {
    this.orden.set(orden);
  }

  ordenarPorFecha() {
    this.turnos().sort((a, b) => {
      const xFecha = a.fecha.localeCompare(b.fecha);
      if(xFecha !== 0) return xFecha;
      //else
      return a.hora.localeCompare(b.hora);
    });
  }

  ordenarPorHora() {
    this.turnos().sort((a, b) => {
      const xHora = a.hora.localeCompare(b.hora);
      if(xHora !== 0) return xHora;
      return a.fecha.localeCompare(b.fecha);
    })
  }
}
