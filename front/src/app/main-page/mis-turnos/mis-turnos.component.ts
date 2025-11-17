import { Component, inject, linkedSignal } from '@angular/core';
import { TurnoService } from '../../services/turnoService';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../auth.service/auth.service';

@Component({
  selector: 'app-mis-turnos',
  imports: [],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.css'
})
export class MisTurnosComponent {
  
  private readonly auth = inject(AuthService);
  private readonly client = inject(TurnoService);

  protected readonly turnosSource = toSignal(this.client.getTurnosById(Number(this.auth.getId()))); 
  protected readonly turnos = linkedSignal(() => this.turnosSource()); 

  verDetalles() {
    
  }

}
