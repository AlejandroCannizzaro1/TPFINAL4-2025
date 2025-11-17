import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  imports: [],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent {

  private readonly router = inject(Router);
  //todo lo q tengo que hacer
  /**
   * arreglar lo de reservar turno en el front porque los carga pero no se puede hacer reserva *
   * que el admin pueda agregar un turno en el calendario 
   * que el admin en su panel pueda buscar por email de usuario
   * que pueda buscar por fecha también quizás, esa función la tendría que hacer en el BE 
   * falta que el admin y el usuario puedan ver sus notificaciones 
     falta asignar una modalidad de estado premium, que yo pensaba poner algo en el nav-bar tipo "Cupon Premium", 
     que el usuario lo compre y eso le da, no se, 10 % de descuento en cada turno por 3 meses y ahi le asignamos estado premium
   */

  routearASettingTurnosDisponibles() {
    this.router.navigateByUrl('/admin/setting_turnos');
  }
  routearAFilterAdmin() {
    this.router.navigateByUrl('admin/filter-admin');
  }

}
