import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Cerveza } from '../models/cerveza/cerveza.module';

@Injectable({
  providedIn: 'root'
})
export class SharedEventService {

  constructor() { }

  private cervezaSeleccionada = new Subject<Cerveza>();
  cervezaSeleccionada$ = this.cervezaSeleccionada.asObservable();

  emitirCervezaSeleccionada(cerveza:Cerveza){
    this.cervezaSeleccionada.next(cerveza);
  }

  private contador = new Subject<number>();
  contador$ = this.contador.asObservable();

  actualizarContador(carrito:number){
    this.contador.next(carrito);
  }
}
