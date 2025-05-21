import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy{

logo:string="/assets/logos/Tropel.jpg"

  ngOnDestroy(): void {
    
  }
  ngOnInit(): void {
    
  }



}
