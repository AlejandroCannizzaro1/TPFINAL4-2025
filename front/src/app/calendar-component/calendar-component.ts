import { Component, effect, ElementRef, inject, Inject, linkedSignal, OnInit, signal, ViewChild } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import esLocale from '@fullcalendar/core/locales/es';
import { Calendar, CalendarOptions } from '@fullcalendar/core';
import { TurnoService } from '../services/turnoService'
import { Turno } from '../entities/turno';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { AuthService } from '../auth.service/auth.service';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { TurnosResponse } from '../entities/turnosResponse';


@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [FullCalendarModule, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './calendar-component.html',
  styleUrls: ['./calendar-component.css']
})
export class CalendarComponent {

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  private turnoClient = inject(TurnoService);
  private auth = inject(AuthService);
  protected readonly idPropio = Number(this.auth.getId());

  private readonly fb = inject(FormBuilder);
  protected readonly servicios = ['Corte masculino', 'Corte femenino', 'Barba', 'Corte + Barba'];
  protected readonly form = this.fb.nonNullable.group({
    tipoServicio: ['', [Validators.required]],
    notas: ['']
  })
  mostrarFormulario = signal(false);
  turnoSeleccionado: Turno | null = null;


  protected readonly turnoResponseSource = toSignal(this.turnoClient.getTurnosDisponibles());
  protected readonly turnoResponse = linkedSignal(() => this.turnoResponseSource() || []);

  protected readonly turnoResponseAllSource = toSignal(this.turnoClient.getTurnos());
  protected readonly turnoResponseAll = linkedSignal(() => this.turnoResponseAllSource());

  get usuarioEsAdmin() {
    return this.auth.isAdmin();
  }

  get tipoServicio() {
    return this.form.controls.tipoServicio;
  }

  get notas() {
    return this.form.controls.notas;
  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, multiMonthPlugin],
    initialView: 'dayGridMonth',
    displayEventTime: false,
    locale: esLocale,
    selectable: true,
    eventClick: (info) => this.handleEventClick(info),
    select: (info) => this.handleDateSelect(info),
  };

  constructor() {
    effect(() => { //Cada vez que un signal cambie
      if (this.usuarioEsAdmin) {
        if (this.turnoResponseAll()) {
          this.cargarTurnos(true);
        }
      } else {
        if (this.turnoResponse()) {
          this.cargarTurnos(false); //Manda a la funcion que ya sabe que hay turnos cargados (porque paso el if)
        }
      }
    })
  }

  cargarTurnos(admin: boolean) {

    let eventos;

    if (!admin) {
      eventos = this.turnoResponse()!.map(t => ({
        id: t.idTurno?.toString(),
        title: `${t.hora} hs`,
        start: `${t.fecha}T${t.hora}:00`,
        extendedProps: t,
        order: t.turnoDisponible ? 0 : 1,
        color: 'green'
      }));
    }

    else {
      eventos = this.turnoResponseAll()!.map(t => ({
        id: t.fields.idTurno?.toString(),
        title: `${t.fields.hora} hs`,
        start: `${t.fields.fecha}T${t.fields.hora}:00`,
        extendedProps: t,
        order: t.fields.turnoDisponible ? 0 : 1,
        color: t.fields.turnoDisponible ? 'green ' : 'red'
      }));
    }

    this.calendarOptions = { ...this.calendarOptions, events: eventos, eventOrder: ['order', 'start'] }; //Le agrego Start asi ademas del orden por disponibilidad, se ordena por horario
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
      next: (t) => {
        this.agregarTurno(t);
        window.location.reload(); //Perdon por esto profes, sabemos que no cumple reactividad pero no pudimos hacer que fullCalendar actualice los eventos
        // de ninguna otra manera :(
      },
      error: (err) => {
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

    if (!turno.turnoDisponible && !this.usuarioEsAdmin) {
      alert("Este turno ya está reservado.");
      return;
    }

    this.turnoSeleccionado = turno;
    this.mostrarFormulario.set(true);
  }

  agregarTurno(turno: Turno) {
    if (turno) {
      this.turnoResponse.update((t) => [...t, turno]);
      this.cargarTurnos(this.usuarioEsAdmin);
      window.location.reload();
    }
  }

  confirmarTurno() {
    if (!this.turnoSeleccionado) return;

    if (this.form.invalid) return;

    if (!this.idPropio) {
      alert("Debes iniciar sesión para reservar turnos.");
      return;
    }

    if (confirm('Desea reservar el turno?')) {
      const tipoServicio = this.form.value.tipoServicio;
      const notas = this.form.value.notas;
      

      this.turnoClient.reservarTurno(this.turnoSeleccionado.idTurno!, this.idPropio, tipoServicio!, notas!).subscribe({
        next: (t) => {
          alert("Turno reservado con éxito");
          console.log(t);

          // limpiar formulario
          this.mostrarFormulario.set(false);
          this.turnoSeleccionado = null;

          window.location.reload();
        },
        error: (e) => {
          alert('Error!');
          console.log(e);
          this.mostrarFormulario.set(false);
          this.turnoSeleccionado = null;

        }
      });
    }
  }

  eliminarTurno() {
    if (!this.turnoSeleccionado) return;

    if (this.auth.isAdmin()) {

      //Eliminar turno
      if (confirm("Esta seguro que desea eliminar el turno?")) {

        this.turnoClient.eliminarTurno(this.turnoSeleccionado.idTurno!, this.idPropio).subscribe((t) => {
          alert('Turno eliminado con exito!');
          console.log(t);
          //Falta borrar el evento en el momento

          this.mostrarFormulario.set(false);
          this.turnoSeleccionado = null;
          window.location.reload();
        });
      }
    }
  }

  cancelarReserva() {
    if (!this.turnoSeleccionado) return;

    //Cancelar una reserva si esta reservada
    if (!this.turnoSeleccionado?.turnoDisponible) {
      if (confirm("Desea cancelar la reserva? Se le enviara una notificacion al cliente")) {
        this.turnoClient.cancelarReservaTurno(this.turnoSeleccionado.idTurno!, this.idPropio).subscribe((t) => {
          alert('Turno cancelado con exito!');
          console.log(t);

          //enviar notificacion!

          this.mostrarFormulario.set(false);
          this.turnoSeleccionado = null;
          window.location.reload();
        });
      }
    }
  }


  cancelar() {
    this.mostrarFormulario.set(false);
    this.turnoSeleccionado = null;
    this.form.reset();
  }
}
