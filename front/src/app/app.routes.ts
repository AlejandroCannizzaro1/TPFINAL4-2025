import { Routes } from '@angular/router';
import { Login } from './login/loginComponent/login';
import { Register } from './login/register/register';
import { MainPage } from './main-page/main-page';
import { AuthGuard } from './guards/auth.guard/auth.guard';
import { NoGuard } from './guards/no.guard/no.guard';
import { CalendarComponent } from './calendar-component/calendar-component';
import { MisTurnosComponent } from './main-page/mis-turnos/mis-turnos.component';
import { AdminPanelComponent } from './main-page/admin/admin-panel/admin-panel.component';
import { RoleGuard } from './guards/role.guard/role.guard'; // <- IMPORTANTE
import { TurnosDisponiblesForm } from './main-page/admin/turnos-disponibles-form/turnos-disponibles-form';
import { FilterAdminComponent } from './main-page/admin/filter-admin/filter-admin.component';
import { NotificacionesUsersComponent } from './main-page/mis-turnos/notificaciones-users/notificaciones-users.component'; 

export const routes: Routes = [
  { path: '', component: MainPage, title: 'Bienvenido' },
  { path: 'login', component: Login, canActivate: [NoGuard], title: 'Iniciar Sesion' },
  { path: 'register', component: Register, canActivate: [NoGuard], title: 'Registrarse' },
  { path: 'calendario', component: CalendarComponent, canActivate: [AuthGuard], title: 'Calendario'},
  { path: 'notificaciones', component: NotificacionesUsersComponent, canActivate: [AuthGuard]},
  // Usuario normal
  { path: 'mis-turnos', component: MisTurnosComponent, canActivate: [AuthGuard], title: 'Mis Turnos' },
  // Solo admin
  { path: 'admin', component: AdminPanelComponent, canActivate: [AuthGuard, RoleGuard], title: 'Panel Admin' },
  { path: 'admin/filter-admin', component: FilterAdminComponent, canActivate: [AuthGuard, RoleGuard] },
  { path: 'admin/setting_turnos', component: TurnosDisponiblesForm, canActivate: [AuthGuard, RoleGuard], title: 'Configuracion Turnos Disponibles' }
  
];


/** Hola soy Joaco */