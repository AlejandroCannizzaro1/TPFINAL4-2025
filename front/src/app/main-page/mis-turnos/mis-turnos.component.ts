import { Component, inject, linkedSignal } from '@angular/core';
import { TurnoService } from '../../services/turnoService';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../auth.service/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mis-turnos',
  imports: [CommonModule],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.css'
})
export class MisTurnosComponent {
  
  private readonly auth = inject(AuthService);
  private readonly client = inject(TurnoService);
  private readonly router = inject(Router);

  protected readonly turnosSource = toSignal(this.client.getTurnosByIdUsuario(Number(this.auth.getId()))); 
  protected readonly turnos = linkedSignal(() => this.turnosSource()); 

  verDetalles(id: number) {
    this.router.navigate(['/mis-turnos', id]);
  }

}
