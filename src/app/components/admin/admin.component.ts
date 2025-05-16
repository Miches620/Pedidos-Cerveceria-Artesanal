import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Cerveza } from '../../models/cerveza/cerveza.module';
import { CervezaService } from '../../services/cerveza.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-admin',
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  nuevaCerveza: FormGroup;

  cervezas: Cerveza[] = [];
  cervezasFiltradas: Cerveza[] = [];

  constructor(private serviceCerveza: CervezaService,private crearCerveza: FormBuilder, private router: Router) {
    this.nuevaCerveza = this.crearCerveza.group({
      cervezaNombre: ['', [Validators.required, Validators.minLength(1)]],
      cervezaCategoria: ['', Validators.required],
      cervezaSRM: ['', [Validators.required, Validators.min(1), Validators.max(50)]],
      cervezaEstilo: ['', Validators.required],
      cervezaIBU: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      cervezaABV: ['', [Validators.required, Validators.min(0), Validators.max(90)]],
      cervezaIMG: [''],
      cervezaInfo: ['', Validators.minLength(20)]
    });
  }

  get cNNombre() {
    return this.nuevaCerveza.get('cervezaNombre');
  }

  get cNCategoria() {
    return this.nuevaCerveza.get('cervezaCategoria');
  }

  get cNSRM() {
    return this.nuevaCerveza.get('cervezaSRM');
  }

  get cNEstilo() {
    return this.nuevaCerveza.get('cervezaEstilo');
  }

  get cNIBU() {
    return this.nuevaCerveza.get('cervezaIBU');
  }

  get cNAVB() {
    return this.nuevaCerveza.get('cervezaABV');
  }

  get cNIMG() {
    return this.nuevaCerveza.get('cervezaIMG');
  }

  get cNInfo() {
    return this.nuevaCerveza.get('cervezaInfo');
  }

  ngOnInit(): void {}

  crearNuevaCerveza(): Cerveza {
    const idNuevaCerveza = 0;

    const returnIMG = this.nuevaCerveza.get("cervezaIMG")?.value;

    const returnInfo = this.nuevaCerveza.get("cervezaInfo")?.value

    let nCerveza: Cerveza = {
      id: idNuevaCerveza,
      nombre: this.nuevaCerveza.get("cervezaNombre")?.value,
      categoria: this.nuevaCerveza.get("cervezaCategoria")?.value,
      SRM: this.nuevaCerveza.get("cervezaSRM")?.value,
      estilo: this.nuevaCerveza.get("cervezaEstilo")?.value,
      ibu: this.nuevaCerveza.get("cervezaIBU")?.value,
      alcohol: this.nuevaCerveza.get("cervezaABV")?.value,
      img: returnIMG==="" ? "assets/cervezas/CervezaRandom.jpg" : returnIMG,
      info: returnInfo==="" ? "No hay descripcion disponible." : returnInfo 
    }
    return nCerveza;
  }

  agregarNuevaCerveza(){
 this.serviceCerveza.agregarCerveza(this.crearNuevaCerveza()).subscribe({
  next: () => {
   this.serviceCerveza.notificarActualizacion()
    this.nuevaCerveza.reset();
     document.getElementById("cerrarModal")?.click();
  },
  error: (e) =>{
    alert("Error al intentar añadir una nueva cerveza al listado. Por favor intenta nuevamente " + e)
  }
 })
  }

}
