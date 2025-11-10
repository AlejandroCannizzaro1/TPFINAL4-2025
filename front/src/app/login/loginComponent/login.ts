import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from '../../entities/usuario';
import { AuthService } from '../../auth.service/auth.service';
import { UsuarioFilterService } from '../../services/filt-user.service'; // <--- asegurate que el archivo se llame así
import { map, take } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  private readonly usuarioFilter = inject(UsuarioFilterService);

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

    const usuario = this.form.getRawValue() as Usuario;
    usuario.email = usuario.email.toLowerCase();

    this.usuarioFilter.getUsuariosNormalizados().pipe(
      map(users => users.find(u =>
        u.email === usuario.email &&
        u.contrasenia === usuario.contrasenia
      )),
      take(1)
    ).subscribe(user => {

      if (!user) {
        alert("Email o contraseña incorrectos.");
        return;
      }

      const token = 'token_' + Math.random().toString(36).substring(2);

      if (user.estadoAdmin) {
        this.authService.login(token, "admin", user.nombreUsuario);
      } else {
        this.authService.login(token, "user", user.nombreUsuario);
      }

      alert("Sesión iniciada con éxito");
      this.router.navigate(['/']);
    });
  }

  navigateToRegister() {
    this.router.navigateByUrl(`/register`);
  }
}
