import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../services/usuarioService';
import { Usuario } from '../../entities/usuario';
import { Router } from '@angular/router';
import { take } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);
  protected readonly waiting = signal(false)

  readonly usuario = input<Usuario>();

  inputType = 'password';
  showPassword = false;

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', [Validators.required]],
    contrasenia: ['', [Validators.required]]
  });

  changeVisual() {
    this.showPassword = !this.showPassword;
    this.inputType = this.showPassword ? 'text' : 'password';
  }

  handleSubmit() {
    this.waiting.set(true);

    if (this.form.invalid) {
      alert("El formulario no puede tener campos vacíos o inválidos.");
      this.waiting.set(false);
      return;
    }

    this.waiting.set(true);

    const nuevoUsuario = this.form.getRawValue() as Usuario;
    nuevoUsuario.email = nuevoUsuario.email.toLowerCase().trim();
    nuevoUsuario.estadoAdmin = nuevoUsuario.email.includes("admin");

    this.usuarioService.checkEmail(nuevoUsuario.email).pipe(take(1)).subscribe(emailExiste => {

      if (emailExiste) {
        alert("Ya existe una cuenta con este correo.");
        return;
      }

      this.usuarioService.addUsuario(nuevoUsuario).subscribe({
        next: () => {
          alert("Cuenta creada con éxito!");
          this.router.navigate(['/login']);
        },
        error: () => alert("Error registrando usuario, intentá de nuevo.")
      });

    });

    this.waiting.set(false);
  }

}
