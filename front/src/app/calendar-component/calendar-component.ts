import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import esLocale from '@fullcalendar/core/locales/es';
import { CalendarOptions } from '@fullcalendar/core';
import { TurnoService } from '../services/turnoService';
import { Turno } from '../entities/turno';
import { FullCalendarModule } from '@fullcalendar/angular';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './calendar-component.html',
  styleUrls: ['./calendar-component.css']
})
export class CalendarComponent implements OnInit {

  usuarioEsAdmin = true;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, multiMonthPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    selectable: true,
    editable: false,
    selectMirror: true,
    eventStartEditable: false,
    eventDurationEditable: false,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    events: [],
    select: (info) => this.handleDateSelect(info),
    eventClick: (info) => this.handleEventClick(info)
  };

  constructor(private turnoClient: TurnoService) { }

  ngOnInit(): void {
    this.cargarTurnos();
  }

  cargarTurnos() {
    this.turnoClient.getTurnosDisponibles().subscribe((turnos: Turno[]) => {
      const eventos = turnos.map(t => ({
        id: t.idTurno?.toString(),
        title: t.hora,
        start: `${t.fecha}T${t.hora}:00`,
        extendedProps: t
      }));

      const diasConDisponibilidad = [...new Set(turnos.map(t => t.fecha))];
      const fondos = diasConDisponibilidad.map(fecha => ({
        start: fecha,
        display: 'background',
        backgroundColor: '#92f796'
      }));

      this.calendarOptions = {
        ...this.calendarOptions,
        events: [...eventos, ...fondos]
      };
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

    const nuevoTurno = {
      fecha,
      hora,
      turnoDisponible: true
    };

    this.turnoClient.crearTurno(nuevoTurno).subscribe({
      next: () => this.cargarTurnos(),
      error: err => console.error("Error creando turno:", err)
    });
  }

  handleEventClick(info: any) {
    if (this.usuarioEsAdmin) return;

    const turno: Turno = info.event.extendedProps;
    const idUsuario = 1;

    this.turnoClient.reservarTurno(turno.idTurno!, idUsuario)
      .subscribe(() => {
        alert("Turno reservado con éxito");
        this.cargarTurnos();
      });
  }
}
