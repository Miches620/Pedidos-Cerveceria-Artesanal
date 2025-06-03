import { NgIf } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modals',
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './modals.component.html',
  styleUrl: './modals.component.css'
})
export class ModalsComponent {

  @Output() notificarAccion = new EventEmitter<number>();
  @Output() notificarLogin = new EventEmitter<boolean>();

  login: FormGroup;

  idModalBorrar: number = -1;
  nombreModalBorrar: string = "";
  estiloModalBorrar: string = "";

  showModalError: boolean = false;
  showModalBorrar: boolean = false;
  showModalLogin: boolean = false;

  mensaje: string = '';
  icono: boolean = false;

  constructor(private formLogin: FormBuilder) {
    this.login = this.formLogin.group({
      formUser: ['', [Validators.required, Validators.minLength(4)]],
      formPass: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])([A-Za-z\d$@$!%*?&]|[^ ]){8,15}$/)]]
    })
  }

  getUser() {
    return this.login.get('formUser');
  }

  getPass() {
    return this.login.get('formPass');
  }

  openModalError(mensaje: string, aviso: boolean) {
    this.mensaje = mensaje;
    this.showModalError = aviso;
  }

  openModalBorrar(id: number, nombre: string, estilo: string) {
    this.idModalBorrar = id;
    this.nombreModalBorrar = nombre;
    this.estiloModalBorrar = estilo;
    this.showModalBorrar = true;
  }

  openModalLogin() {
    this.showModalLogin = true;
  }

  closeModal(modal: string) {
    switch (modal) {
      case "error":
        return this.showModalError = false;
      case "borrar":
        return this.showModalBorrar = false;
      case "login":
        return this.showModalLogin = false;
      default:
        throw new Error("El modal no existe.");
    }
  }

  notificarBorrado() {
    this.notificarAccion.emit(this.idModalBorrar);
    this.showModalBorrar = false;
  }

  notificarIntentoDeLogin(){
    this.notificarLogin.emit(true);
    this.login.get('formUser')?.setValue("");
    this.login.get('formPass')?.setValue("");
    this.showModalLogin=false;
  }

}
