import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import esLocale from '@fullcalendar/core/locales/es';
import { CalendarOptions } from '@fullcalendar/core';
import { TurnoClient } from '../services/turnoService';
import { Turno } from '../entities/turno';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit {

  usuarioEsAdmin = true; // cambiar cuando haya login

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

  constructor(private turnoClient: TurnoClient) { }

  ngOnInit(): void {
    this.cargarTurnos();
  }

  cargarTurnos() {
    this.turnoClient.getTurnosDisponibles().subscribe((turnos: Turno[]) => {

      // Mostrar solo turnos disponibles con su hora
      const eventos = turnos.map(t => ({
        id: t.idTurno?.toString(),
        title: t.hora,
        start: `${t.fecha}T${t.hora}:00`,
        extendedProps: t
      }));

      // Colorear solo días con disponibilidad → verde
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


  // handleDateSelect es la función que se dispara cuando hacés clic en un día vacío del calendario (no en un turno).
  // Sirve para crear un turno nuevo. Solo deja hacerlo si el usuario es admin.
  handleDateSelect(info: any) {
    if (!this.usuarioEsAdmin) return;

    const fecha = info.startStr.split('T')[0];
    let hora = prompt("Ingrese hora (HH:MM):");
    if (!hora) return;

    // Normalizar formato
    hora = hora.trim();
    if (!hora.includes(":")) hora = hora + ":00";
    if (hora.length === 4) hora = "0" + hora;  // Ej: 9:00 → 09:00

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

  //handleEventClick es la función que se ejecuta cuando el usuario hace clic en un turno ya creado dentro del calendario.
  //Si el usuario es Admin: no hace nada (porque el admin solo crea turnos, no los reserva).
 //Si el usuario es solo un  Usuario: intenta reservar el turno.
  handleEventClick(info: any) {
    if (this.usuarioEsAdmin) return;

    const turno: Turno = info.event.extendedProps;
    const idUsuario = 1; // luego lo sacás del login

    this.turnoClient.reservarTurno(turno.idTurno!, idUsuario)
      .subscribe(() => {
        alert("Turno reservado con éxito");
        this.cargarTurnos();
      });
  }
}