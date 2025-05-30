import { NgFor, NgIf } from '@angular/common';
import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { BeerListComponent } from '../beer-list/beer-list.component';

@Component({
  selector: 'app-modals',
  imports: [NgIf, NgFor],
  templateUrl: './modals.component.html',
  styleUrl: './modals.component.css'
})
export class ModalsComponent {

  @ViewChild(BeerListComponent, { static: false })
  cervezaDatos!: BeerListComponent;

  @Output() notificarAccion = new EventEmitter<number>();;

  idModalBorrar: number = -1;
  nombreModalBorrar: string = "";
  estiloModalBorrar: string = "";

  showModalError: boolean = false;
  showModalBorrar: boolean = false;
  showModalFavoritos: boolean = false;
  mensaje: string = '';
  icono:boolean=false;

  favsDelUsuario:any[]=[]

  openModalError(mensaje: string, aviso:boolean) {
    this.mensaje = mensaje;
    this.showModalError = true;
  }

  openModalBorrar(id: number, nombre: string, estilo: string) {
    this.idModalBorrar = id;
    this.nombreModalBorrar = nombre;
    this.estiloModalBorrar = estilo;
    this.showModalBorrar = true;
  }

  closeModal(modal: string) {
    modal === "error" ? this.showModalError = false
      : this.showModalBorrar = false;
  }

  /*openModalFavs<T>(lista:T[]){
    this.showModalFavoritos=true;
    this.favsDelUsuario= lista;
  }*/

  /*closeModalFavs(){
    this.showModalFavoritos=false;
    this.favsDelUsuario= [];
  }*/

  notificarBorrado() {
    this.notificarAccion.emit(this.idModalBorrar);
    this.showModalBorrar = false;
  }

}
