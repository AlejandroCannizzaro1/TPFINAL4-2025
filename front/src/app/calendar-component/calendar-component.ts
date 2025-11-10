import { Component, OnInit } from '@angular/core';
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


@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [FullCalendarModule, FormsModule, CommonModule],
  templateUrl: './calendar-component.html',
  styleUrls: ['./calendar-component.css']
})
export class CalendarComponent implements OnInit {

  mostrarFormulario = false;
  turnoSeleccionado: Turno | null = null;
  tipoServicio: string = '';
  notas: string = '';

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

  constructor(
    private turnoClient: TurnoService,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarTurnos();
  }

  cargarTurnos() {
    this.turnoClient.getTurnosDisponibles()
      .subscribe((turnos: Turno[]) => {
        const eventos = turnos.map(t => ({
          id: t.idTurno?.toString(),
          title: t.hora,
          start: `${t.fecha}T${t.hora}:00`,
          extendedProps: t
        }));

        this.calendarOptions = { ...this.calendarOptions, events: eventos };
      });
  }

  handleDateSelect(info: any) {
    if (!this.usuarioEsAdmin) return;

    const fecha = info.startStr.split('T')[0];
    let hora = prompt("Ingrese hora (HH:MM):");
    if (!hora) return;

    hora = hora.trim();
    if (!hora.includes(":")) hora = hora + ":00";
    if (hora.length === 4) hora = "0" + hora;

    const nuevoTurno = { fecha, hora, turnoDisponible: true };

    this.turnoClient.crearTurno(nuevoTurno).subscribe(() => this.cargarTurnos());
  }

handleEventClick(info: any) {
  const turno: Turno = info.event.extendedProps;
  const idUsuario = Number(localStorage.getItem("idUsuario"));

  if (!idUsuario) {
    alert("Debes iniciar sesión para reservar turnos.");
    return;
  }

  if (!turno.turnoDisponible) {
    alert("Este turno ya está reservado.");
    return;
  }

  this.turnoSeleccionado = turno;
  this.mostrarFormulario = true;
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
    this.mostrarFormulario = false;
    this.tipoServicio = '';
    this.notas = '';

    this.cargarTurnos();
  }, () => {
    alert("Error reservando turno, intenta nuevamente.");
  });
}

  cancelar() {
    this.mostrarFormulario = false;
    this.tipoServicio = '';
    this.notas = '';
  }
}
