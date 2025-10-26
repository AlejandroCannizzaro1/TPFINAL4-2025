import { Routes } from '@angular/router';
import { Login } from './login/login';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login', pathMatch: 'full', title: "Iniciar Sesion!"
    },
    {
        path: 'login', component:Login
    }
];
