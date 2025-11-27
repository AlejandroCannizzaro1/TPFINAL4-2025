import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TurnoService } from '../../../services/turnoService';
import { Turno } from '../../../entities/turno';
import { AuthService } from '../../../auth.service/auth.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-turnos-disponibles-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './turnos-disponibles-form.html',
  styleUrl: './turnos-disponibles-form.css'
})
export class TurnosDisponiblesForm {
  private readonly fb = inject(FormBuilder);
  private readonly client = inject(TurnoService);

  public readonly today = new Date();
  private readonly dia = this.today.getDate();
  private readonly mes = this.today.getMonth();
  private readonly anio = this.today.getFullYear();
  private readonly auth = inject(AuthService);

  public loading = false; // indicador de carga
  public diasGenerar = 7; // días a generar, editable si querés hacerlo dinámico

  protected readonly form = this.fb.nonNullable.group({
    apertura: [8, [Validators.required, Validators.min(0), Validators.max(24)]],
    cierre: [17, [Validators.required, Validators.min(0), Validators.max(24)]],
    cierreXmedio: [false],
    cierreMedio: [12, [Validators.min(0), Validators.max(24)]],
    aperturaMedio: [13, [Validators.min(0), Validators.max(24)]],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required]
  });


  get cierreXmedio() {
    return this.form.controls.cierreXmedio;
  }

  getLastDayOfMonth(year: number, month: number) {
    let fecha = new Date(year, month + 1, 0);
    return fecha.getDate();
  }

  get fechaInicio() {
    return this.form.controls.fechaInicio;
  }

  formatLocalDate(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }


  async handleSubmit() {
    if (this.form.invalid) {
      alert("El formulario está incompleto!");
      return;
    }

    const info = this.form.getRawValue();

    // Validar lógica cierre a medio día
    if (info.cierreXmedio) {
      if (!(info.apertura < info.cierreMedio && info.cierreMedio <= info.aperturaMedio && info.aperturaMedio < info.cierre)) {
        alert('Por favor, asegúrate que los horarios de cierre y apertura a medio día sean lógicos y en orden.');
        return;
      }
    }

    // Validar fechas inicio y fin
    const fechaInicioObj = new Date(info.fechaInicio);
    const fechaFinObj = new Date(info.fechaFin);

    // Normalizar horas a cero para comparar solo fechas
    fechaInicioObj.setHours(0, 0, 0, 0);
    fechaFinObj.setHours(0, 0, 0, 0);

    if (fechaFinObj < fechaInicioObj) {
      alert("La fecha fin no puede ser anterior a la fecha inicio.");
      return;
    }

    const idAdminStr = this.auth.getId();
    if (!idAdminStr) {
      alert('No estás logueado o no se encontró el ID de usuario.');
      return;
    }
    const idAdmin = Number(idAdminStr);

    if (!confirm("Confirma que los horarios son correctos? (Eliminar turnos existentes fuera de rango no está contemplado)")) {
      return;
    }

    this.loading = true;

    // Convertir fechas a string para filtrar turnos
    //const fechaInicioStr = fechaInicioObj.toISOString().slice(0, 10);  -- error
    const fechaInicioStr = this.formatLocalDate(fechaInicioObj);
    //const fechaFinStr = fechaFinObj.toISOString().slice(0, 10);        --error
    const fechaFinStr = this.formatLocalDate(fechaFinObj);

    let turnosExistentes: Turno[] = [];
    try {
      const todosTurnos = await firstValueFrom(this.client.getTurnos());
      const turnos = todosTurnos.map(t => t.fields);
      // Filtrar por rango fecha inicio-fin
      turnosExistentes = turnos.filter(t => t.fecha >= fechaInicioStr && t.fecha <= fechaFinStr);
    } catch (err) {
      console.error('Error obteniendo turnos existentes:', err);
      alert('No se pudieron obtener los turnos existentes. Intenta más tarde.');
      this.loading = false;
      return;
    }

    const creaciones: Promise<any>[] = [];

    // Recorrer desde fechaInicio a fechaFin
    for (let fecha = new Date(fechaInicioObj.getFullYear(), fechaInicioObj.getMonth(), fechaInicioObj.getDate());
      fecha <= fechaFinObj;
      fecha.setDate(fecha.getDate() + 1)) {
      const diaSemana = fecha.getDay();
      if (diaSemana === 0 || diaSemana === 6) continue; // saltar fines de semana

      const fechaStr = fecha.toISOString().slice(0, 10);

      const horasAInsertar: number[] = [];
      if (info.cierreXmedio) {
        for (let h = info.apertura; h < info.cierreMedio; h++) horasAInsertar.push(h);
        for (let h = info.aperturaMedio; h < info.cierre; h++) horasAInsertar.push(h);
      } else {
        for (let h = info.apertura; h < info.cierre; h++) horasAInsertar.push(h);
      }

      for (const horaNum of horasAInsertar) {
        const horaStr = `${Math.floor(horaNum).toString().padStart(2, '0')}:00`;

        const turnoYaExiste = turnosExistentes.some(t => t.fecha === fechaStr && t.hora === horaStr);
        if (turnoYaExiste) {
          console.log(`Turno para ${fechaStr} ${horaStr} ya existe, no se crea.`);
          continue;
        }

        const datosTurno = {
          fecha: fechaStr,
          hora: horaStr,
          turnoDisponible: true,
          tipoServicio: 'Servicio estándar',
          notas: ''
        };

        console.log(`Intentando crear turno ${datosTurno}`);
        const prom = firstValueFrom(this.client.crearTurnoAdmin(idAdmin, datosTurno))
          .then(res => console.log('Turno creado:', res))
          .catch(err => console.error('Error creando turno:', err));

        creaciones.push(prom);
      }
    }

    await Promise.all(creaciones);

    this.loading = false;
    alert('Se crearon todos los turnos disponibles correctamente!');
  }


}