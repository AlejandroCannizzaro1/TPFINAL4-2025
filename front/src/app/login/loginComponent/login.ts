import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service/auth.service';
import { UsuarioService } from "../../services/usuarioService";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // ✅ IMPORTANTE
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  private readonly usuarioService = inject(UsuarioService);

  inputType = 'password';
  showPassword = false;

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    contrasenia: ['', [Validators.required]]
  });

  changeVisual() {
    this.showPassword = !this.showPassword;
    this.inputType = this.showPassword ? 'text' : 'password';
  }

handleSubmit() {
  if (this.form.invalid) {
    alert("El formulario no puede tener caracteres inválidos o vacíos!");
    return;
  }

  const { email, contrasenia } = this.form.getRawValue();

  this.usuarioService.login(email.toLowerCase(), contrasenia).subscribe({
    next: (user) => {
      const token = 'token_' + Math.random().toString(36).substring(2);

      //  GUARDAMOS EL ID EN EL LOCALSTORAGE -- esto se hace en auth --
      //localStorage.setItem("idUsuario", user.idUsuario.toString());

      if (user.estadoAdmin) {
        this.authService.login(user.idUsuario, token, "admin", user.nombreUsuario);
      } else {
        this.authService.login(user.idUsuario, token, "user", user.nombreUsuario);
      }

      alert("Sesión iniciada con éxito");
      this.router.navigate(['/']);
    },
    error: () => {
      alert("Email o contraseña incorrectos.");
    }
  });
}

  navigateToRegister() {
    this.router.navigateByUrl('/register');
  }
}
