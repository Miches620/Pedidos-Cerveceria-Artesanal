
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { CervezaService } from '../../services/cerveza.service';
import { Cerveza } from '../../models/cerveza/cerveza.module';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-beer-list',
  imports: [NgFor, NgIf],
  templateUrl: './beer-list.component.html',
  styleUrl: './beer-list.component.css'
})
export class BeerListComponent implements OnInit {

  cervezas: Cerveza[] = [];

  isHovering = false;



  constructor(private listaDeCervezas: CervezaService) { }

  ngOnInit() {
    this.listaDeCervezas.getCervezas().subscribe((data) => {
      this.cervezas = data;
    });
  }

  mouseHovering() {
    this.isHovering = true;
  }
  mouseLeaving() {
    this.isHovering = false;
  }

}
