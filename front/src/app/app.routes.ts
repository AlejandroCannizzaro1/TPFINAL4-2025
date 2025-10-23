import { Routes } from '@angular/router';
import { Login } from './components/login/login';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login', pathMatch: 'full', title: "Iniciar Sesion!"
    },
    {
        path: 'login', component:Login
    }
    //Paths Ejemplos
    /** 
     * path: '**', redirectTo: 'login"
     * 
     * 
     * 
     */
];
