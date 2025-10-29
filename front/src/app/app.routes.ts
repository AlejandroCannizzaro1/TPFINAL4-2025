import { Routes } from '@angular/router';
import { Login } from './login/loginComponent/login';
import { Register } from './login/register/register';
import { MainPage } from './main-page/main-page';
import { AuthGuard } from './guards/auth.guard/auth.guard';
import { NoGuard } from './guards/no.guard/no.guard';


export const routes: Routes = [
    {
        path: '', component: MainPage
    },
    {
        path: 'login', component:Login, canActivate: [NoGuard]
    },
    {
        path: 'register', component:Register, canActivate: [NoGuard]
    }
    //A partir de aca hay que usar el isLoggedIn del servicio auth.service para verificar que este logeado
    //y si no lo esta, mandarlo al login
];
