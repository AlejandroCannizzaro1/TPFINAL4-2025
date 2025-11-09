import { Component, effect, inject, input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioClient } from '../../services/usuarioService';
import { Usuario } from '../../entities/usuario';
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

  inputType: string = 'text';
  showPassword: boolean = false;

  //constructor() {
  //  effect(() => {
  //    if(this.usuario()) {
  //      
  //    }
  //  })
  // }
  
  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")]],
    nombreUsuario: ['', [Validators.required]],
    contrasenia: ['', [Validators.required,]], //Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$')]
  });
  
  changeVisual() { //Cambia la password para ver o no
    this.showPassword = !this.showPassword;
    this.inputType = this.showPassword ? 'password' : 'text';
  };

  handleSubmit() {
    //Se verifica que el formulario este correcto
    if(this.form.invalid) {
      alert("El formulario no puede tener caracteres invalidos o vacios!");
      return;
    }

    if(confirm('Desea registrarse?')) {
      //Se crea el objeto usuario con los datos del formulario
      const usuario = this.form.getRawValue() as Usuario;
      usuario.email = usuario.email.toLowerCase();

      //verificar que el mail no este en la db
      this.client.getUsuarios().subscribe((usuarios) => {
        const encontrado = usuarios.some(us => us.email === usuario.email);
        if(encontrado){
          alert("El mail ya tiene una cuenta asignada");
          return;
        }
        //verificamos si es un admin
        if(usuario.email.includes("admin")) {
            usuario.estadoAdmin = true;
        }
        else{ usuario.estadoAdmin = false };
        
        //anadir usuario
        this.client.addUsuario(usuario).subscribe(() => {
          alert("Cuenta creada con exito!");
          this.form.reset();
          this.router.navigateByUrl(`/login`);
        });

      });
      
    }
  }

}
