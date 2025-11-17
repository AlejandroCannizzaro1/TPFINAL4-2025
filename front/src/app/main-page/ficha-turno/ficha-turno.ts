import { Component, inject, input, linkedSignal } from '@angular/core';
import { Turno } from '../../entities/turno';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TurnoService } from '../../services/turnoService';
import { AuthService } from '../../auth.service/auth.service';

@Component({
  selector: 'app-ficha-turno',
  imports: [],
  templateUrl: './ficha-turno.html',
  styleUrl: './ficha-turno.css'
})
export class FichaTurno {
  private readonly route = inject(ActivatedRoute);
  private readonly client = inject(TurnoService);
  private readonly auth = inject(AuthService);
  
  protected readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly turnoSource = toSignal(this.client.getTurnosById(Number(this.id)));
  protected readonly turno = linkedSignal(() => this.turnoSource());

  esMiTurno() { //El turno esta vinculado a mi cuenta?
    return (this.turno()?.usuarioId === Number(this.auth.getId()));
  }
}
