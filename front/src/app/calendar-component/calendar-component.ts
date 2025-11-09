import { Component, inject } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import esLocale from '@fullcalendar/core/locales/es';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';




@Component({
  selector: 'app-calendar-component',
  imports: [FullCalendarModule],
  templateUrl: './calendar-component.html',
  styleUrl: './calendar-component.css'
})
export class CalendarComponent {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, multiMonthPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    weekends: false,
    editable: true,
    selectable: true,
    selectMirror: true,
    slotMinTime: "08:00",
    slotMaxTime: "20:00",
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    }
  };


  handleDateSelect(selectInfo: any) {
    console.log("Hola!");
    const title = prompt('Enter a new event title:');
    const description = prompt('Enter a description for the event: ');
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        title,
        description,
        start: selectInfo.startStr,
        end: selectInfo.endStr
      });
    }
  }
  handleEventClick(clickInfo: any) {
  alert( `Event: ${clickInfo.event.title}\n\n` + (clickInfo.event.extendedProps.description ? `Details: ${clickInfo.event.extendedProps.description}` : ''));
}
}

//Solo seleccionar un time frame (30 min), no se puede dia, ni semana.
//No dragear, solo click