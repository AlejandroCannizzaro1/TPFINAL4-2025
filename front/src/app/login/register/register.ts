import { Component, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../services/usuarioService';
import { Usuario } from '../../entities/usuario';
import { Router } from '@angular/router';
import { UsuarioFilterService } from '../../services/filt-user.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly client = inject(UsuarioService);
  private readonly router = inject(Router);
  private readonly usuarioFilter = inject(UsuarioFilterService);

  readonly usuario = input<Usuario>();

  inputType = 'text';
  showPassword = false;

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")]],
    nombreUsuario: ['', [Validators.required]],
    contrasenia: ['', [Validators.required]]
  });

  changeVisual() {
    this.showPassword = !this.showPassword;
    this.inputType = this.showPassword ? 'password' : 'text';
  }

  handleSubmit() {

    if (this.form.invalid) {
      alert("El formulario no puede tener caracteres invalidos o vacios!");
      return;
    }

    if (confirm('Desea registrarse?')) {

      const usuario = this.form.getRawValue() as Usuario;
      usuario.email = usuario.email.toLowerCase().trim();

      this.usuarioFilter.getUsuariosNormalizados().pipe(take(1)).subscribe(usuarios => {

        const encontrado = usuarios.some(us => us.email === usuario.email);

        if (encontrado) {
          alert("El mail ya tiene una cuenta asignada");
          return;
        }

        usuario.estadoAdmin = usuario.email.includes("admin");

        this.client.addUsuario(usuario).subscribe(() => {
          alert("Cuenta creada con éxito!");
          this.form.reset();
          this.router.navigateByUrl(`/login`);
        });

      });

    }
  }

}
