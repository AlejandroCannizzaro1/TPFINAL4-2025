import { Routes } from '@angular/router';
import { Login } from './login/loginComponent/login';
import { Register } from './login/register/register';
import { MainPage } from './main-page/main-page';
import { AuthGuard } from './guards/auth.guard/auth.guard';
import { NoGuard } from './guards/no.guard/no.guard';
import { CalendarComponent } from './calendar-component/calendar-component';


export const routes: Routes = [
    {
        path: '', component: MainPage, title: 'Bienvenido'
    },
    {
        path: 'login', component:Login, canActivate: [NoGuard], title: 'Iniciar Sesion'
    },
    {
        path: 'register', component:Register, canActivate: [NoGuard], title: 'Registrarse'
    },
    {
        path: 'calendario', component:CalendarComponent, canActivate: [AuthGuard], title: 'Calendario'
    }
    //Ahora usamos los canActivate para restringir paginas. NoGuard: Verifica que el usuario NO este logeado, AuthGuard: usuario SI esta logeado, RoleGuard: usuario ES admin
];
