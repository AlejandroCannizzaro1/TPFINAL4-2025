import { Routes } from '@angular/router';
import { Login } from './login/loginComponent/login';
import { Register } from './login/register/register';


export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login', pathMatch: 'full', title: "Iniciar Sesion!"
    },
    {
        path: 'login', component:Login
    },
    {
        path: 'register', component:Register
    }
];
