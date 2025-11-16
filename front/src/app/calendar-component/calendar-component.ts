import { Component, effect, inject, Inject, linkedSignal, OnInit, signal } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import esLocale from '@fullcalendar/core/locales/es';
import { CalendarOptions } from '@fullcalendar/core';
import { TurnoService } from '../services/turnoService'
import { Turno } from '../entities/turno';
import { FullCalendarModule } from '@fullcalendar/angular';
import { AuthService } from '../auth.service/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { TurnosResponse } from '../entities/turnosResponse';


@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [FullCalendarModule, FormsModule, CommonModule],
  templateUrl: './calendar-component.html',
  styleUrls: ['./calendar-component.css']
})
export class CalendarComponent {

  mostrarFormulario = signal(false);
  turnoSeleccionado: Turno | null = null;
  tipoServicio: string = '';
  notas: string = '';
  private turnoClient = inject(TurnoService);
  private auth = inject(AuthService);

  protected readonly turnoResponseSource = toSignal(this.turnoClient.getTurnos());
  protected readonly turnoResponse = linkedSignal(() => this.turnoResponseSource() || []);

  get usuarioEsAdmin() {
    return this.auth.isAdmin();
  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, multiMonthPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    selectable: true,
    eventClick: (info) => this.handleEventClick(info),
    select: (info) => this.handleDateSelect(info),
  };

  constructor() {
    effect(() => { //Cada vez que el signal de turnos cambie (recibe los turnos del service)
      if (this.turnoResponse()) {
        this.cargarTurnos(); //Manda a la funcion que ya sabe que hay turnos cargados (porque paso el if)
      }
    }) //De paso es reactive porque si se modifica en cualquier momento, los turnos se cargan
  }

  cargarTurnos() {
    if (this.turnoResponse()) {
      const eventos = this.turnoResponse()!.map(t => ({
        id: t.fields.idTurno?.toString(),
        title: t.fields.hora,
        start: `${t.fields.fecha}T${t.fields.hora}:00`,
        extendedProps: t
      }));
      this.calendarOptions = { ...this.calendarOptions, events: eventos };
    }
  }

  agregarTurno(turno: Turno) {
    if (turno) {
      //this.turnoResponse.update((t) => [...t, turno]);
    }
  }

  handleDateSelect(info: any) {
    if (!this.usuarioEsAdmin) return;

    const idAdminStr = localStorage.getItem('userId');
    if (!idAdminStr) {
      alert('No se pudo obtener el ID de admin. Por favor, inicia sesión nuevamente.');
      return;
    }
    const idAdmin = Number(idAdminStr);
    if (isNaN(idAdmin)) {
      alert('ID de admin inválido.');
      return;
    }

    const fecha = info.startStr.split('T')[0];
    let hora = prompt("Ingrese hora (HH:MM):");
    if (!hora) return;

    hora = hora.trim();
    if (!hora.includes(":")) hora = hora + ":00";
    if (hora.length === 4) hora = "0" + hora;

    const nuevoTurno = { fecha, hora, turnoDisponible: true, tipoServicio: 'Servicio estándar', notas: '' };

    this.turnoClient.crearTurnoAdmin(idAdmin, nuevoTurno).subscribe({ //No se carga el turno reactivamente
      next: (t) => this.agregarTurno(t),//this.cargarTurnos(),
      error: err => {
        alert('Error al crear turno');
        console.error(err);
      }
    });
  }


  handleEventClick(info: any) {
    const turno: Turno = info.event.extendedProps;
    const idUsuario = Number(localStorage.getItem("userId"));

    if (!idUsuario) {
      alert("Debes iniciar sesión para reservar turnos.");
      return;
    }

    if (!turno.turnoDisponible) {
      alert("Este turno ya está reservado.");
      return;
    }

    this.turnoSeleccionado = turno;
    this.mostrarFormulario.set(true);
  }


  confirmarTurno() {
    if (!this.turnoSeleccionado) return;

    const idUsuario = Number(localStorage.getItem("idUsuario"));
    if (!idUsuario) {
      alert("Debes iniciar sesión para reservar turnos.");
      return;
    }

    const data = {
      idUsuario: idUsuario,
      tipoServicio: this.tipoServicio,
      notas: this.notas
    };

    this.turnoClient.reservarTurno(this.turnoSeleccionado.idTurno!, data).subscribe(() => {
      alert("Turno reservado con éxito");

      // limpiar formulario
      this.mostrarFormulario.set(false);
      this.tipoServicio = '';
      this.notas = '';

      this.cargarTurnos();
    });
  }

  cancelar() {
    this.mostrarFormulario.set(false);
    this.tipoServicio = '';
    this.notas = '';
  }
}
