import { Component, effect, inject, input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioClient } from '../usuarioClient';
import { Usuario } from '../usuario';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly client = inject(UsuarioClient);
  private readonly router = inject(Router);

  readonly usuario = input<Usuario>();

  constructor() {
    effect(() => {
      if(this.usuario()) {
        
      }
    })
  }
  
  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', [Validators.required]],
    contrasenia: ['', [Validators.required]],
    estadoAdmin: [false, [Validators.required]]
  });
  
  handleSubmit() {
    if(this.form.invalid) {
      alert("MAL");
      return;
    }

    if(confirm('Desea registrarse si que si?')) {
      const usuario = this.form.getRawValue() as Usuario;
      //verificar que el mail no este en la db



      //anadir usuario
      this.client.addUsuario(usuario).subscribe(() => {
        alert("Lo lograstes amigo");
        this.form.reset();
        this.router.navigateByUrl(`/login`);
      })
    }
  }


}
