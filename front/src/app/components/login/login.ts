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