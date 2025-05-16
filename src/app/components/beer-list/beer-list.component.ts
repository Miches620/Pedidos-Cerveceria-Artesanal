
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { CervezaService } from '../../services/cerveza.service';
import { Cerveza } from '../../models/cerveza/cerveza.module';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-beer-list',
  imports: [NgFor],
  templateUrl: './beer-list.component.html',
  styleUrl: './beer-list.component.css'
})
export class BeerListComponent implements OnInit {

  cervezas: Cerveza[] = [];
  cervezasFiltradas: Cerveza[] = [];

  constructor(private serviceCerveza: CervezaService) { }

  ngOnInit(): void {
    this.obtenerCervezas();

    this.serviceCerveza.refrescarLista$.subscribe(()=>{
      this.obtenerCervezas;
    });
  }

  obtenerCervezas():void{
    this.serviceCerveza.getCervezas().subscribe((data) => {
      this.cervezas = data;
      this.cervezasFiltradas = data;
    });
  }

  filtrarPorEstilos(): Cerveza[] {
    return this.cervezasFiltradas = [...this.cervezas].sort((a, b) => a.estilo.localeCompare(b.estilo));
  }

filtrarPor(atributo: keyof Cerveza):Cerveza[]{
  return this.cervezasFiltradas = [...this.cervezas].sort((a,b) => {
    const valorA = a[atributo];
    const valorB= b[atributo];
    return Number(valorA) - Number(valorB)
  })
}

}
