import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../entities/usuario';
import { Router } from '@angular/router';
import { UsuarioClient } from '../../services/usuarioService';
import { AuthService } from '../../auth.service/auth.service';
import { map, take } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly client = inject(UsuarioClient);
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);

  readonly usuario = input<Usuario>();

  protected loggedIn = false;
 
  inputType: string = 'password';
  showPassword: boolean = false;

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')]],
    contrasenia: ['', [Validators.required]], //Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$')]
  });

  changeVisual() { //Cambia la password para ver o no
    this.showPassword = !this.showPassword;
    this.inputType = this.showPassword ? 'password' : 'text';
  };
  
  handleSubmit(){


    //Borrar esto
    
    
    if(this.form.invalid) {
      alert("El formulario no puede tener caracteres invalidos o vacios!");
      return;
    }
    
    if(confirm('Desea iniciar sesion?')) {
      //Se crea el objeto usuario con los datos del formulario
      const usuario = this.form.getRawValue() as Usuario;
      usuario.email = usuario.email.toLowerCase();
      
      this.client.getUsuarios().pipe(
        map(users => users.find((user) => (user.email === usuario.email) && (user.contrasenia === usuario.contrasenia))), take(1))
        .subscribe(user => {
          if(user){
            const token = 'token_' + Math.random().toString(36).substring(2) + user.id?.toString();
            console.log(token);
            if(user.estadoAdmin) {
              this.authService.login(token, "admin", user.nombreUsuario);
            }
            else {
              this.authService.login(token, "user", user.nombreUsuario);
            }
            alert("Succesful");
            this.router.navigate(['/']);
          }
        });
    }
  };


  navigateToRegister() {
    this.router.navigateByUrl(`/register`);
  }
}
//Ejemplo LoginClient (solo hace solicitudes http)
/**
 *  Habilitar fetch:
 *  HAY QUE IR A APPCONFIG EN GLOBAL Y METER:
 *    provideHttpClient(withFetch()) //Ahora en vez de XHR* se puede usar fetch
 * 
 * Servicio client
 * export class ...
 * 
 *  private readOnly http = inject(HttpClient);
 *  private readOnly baseUrl =  'localhost bla bla bla'
 * 
 *  5 metodos:
 *  getMovies (movies, clientes, turnos lo que sea){
 *    return this.http.(todos los metodos usables)get<Movie[]>(this.baseUrl);
 * }
 * getMovieById(id: string | number){
 *    return this.http.get<Movie>(`${this.baseUrl}/${id}`);
 * }
 *
 * addMovie(movie: Movie){
 *    return this.http.post<Movie>(this.baseUrl, movie);
 * }
 * 
 * updateMovie(movie: Movie, id: string | number){
 *    return this.http.put<Movie>(`${this.baseUrl}/${id}`, movie);
 * }
 * 
 * deleteMovie(id: string | number){
 *    return this.http.delete(`${this.baseUrl}/${id}`); //No hacer asercion de tipo (<movie>);
 * }
 * 
 * Para decir que un parametro no es opcional al llamar a un metodo se le pone !
 * ej: funcion(this.parametroNoOpcional!);
 * 
 * 
 * .subscribe despues del metodo http. se dispara la solicitud y hace el callback?
 * o sea que hace que se ejecute al toque perro
 * 
 * despues en el component:
 * protected readonly client = inject(MovieClient);
 * protected readonly movies = toSignal(this.client.getMovies());
 * protected readonly isLoading = computed(() => this.movies() === undefined)
 * 
 * senales o miembros que se exponen al html (o a otro componente?) tienen q ser protected, no private
 */