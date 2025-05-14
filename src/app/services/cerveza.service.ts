import { Injectable } from '@angular/core';
import { Cerveza } from '../models/cerveza/cerveza.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CervezaService {
  
  constructor(private http: HttpClient) { }
  

  getCervezas(): Observable<Cerveza[]> {
    return this.http.get<Cerveza[]>('http://localhost:3000/cervezas');
    
  }
}
