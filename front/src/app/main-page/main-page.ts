import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service/auth.service';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css'
})
export class MainPage {

  protected readonly auth = inject(AuthService);
  
  

}
