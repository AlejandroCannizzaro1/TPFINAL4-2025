import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  user_email = '';
  user_password = '';
  

  onSubmit(){
    //verificacion de cont
    if(this.user_email.trim() == '' || this.user_password.trim() == '' ){
      alert("Los inputs no pueden estar vacios!");
      return;
    }
    alert("Enviado correctamente");

    //Buscar en base de datos
    
  }
}
