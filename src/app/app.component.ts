import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";
import { BeerListComponent } from './components/beer-list/beer-list.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent,BeerListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'cerveceria-artesanal';
}
