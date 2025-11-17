import { Component, inject, input, linkedSignal } from '@angular/core';
import { Turno } from '../../entities/turno';
import { ActivatedRoute, Router } from '@angular/router';
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
  private readonly router = inject(Router);
  private readonly client = inject(TurnoService);
  private readonly auth = inject(AuthService);
  private readonly idUsuario = Number(this.auth.getId());
  
  protected readonly idTurno = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly turnoSource = toSignal(this.client.getTurnosById(this.idTurno));
  protected readonly turno = linkedSignal(() => this.turnoSource());

  esMiTurno() { //El turno esta vinculado a mi cuenta?
    return (this.turno()?.usuarioId === this.idUsuario);
  }

  cancelarReserva() {
    if(confirm("Esta seguro que desea cancelar su reserva?")){
      this.client.cancelarReserva(this.idTurno, this.idUsuario).subscribe({
        next: (t) => {
          console.log(t);
          alert("Turno cancelado con exito!");
          this.router.navigateByUrl('/mis-turnos');
        },
        error: (e) => {
          console.log(e);
          alert("Error esperado... turno cancelado de igual manera");
          this.router.navigateByUrl('/mis-turnos');
        }
      });
    }
  }
}
