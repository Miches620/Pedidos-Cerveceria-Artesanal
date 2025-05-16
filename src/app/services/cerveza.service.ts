import { Injectable } from '@angular/core';
import { Cerveza } from '../models/cerveza/cerveza.module';
import { HttpClient} from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CervezaService {

  private url:string="http://localhost:3000/cervezas"
  private refrescarListaSubject = new Subject<void>();
  
  refrescarLista$ = this.refrescarListaSubject.asObservable();
  
  constructor(private http: HttpClient) { }

notificarActualizacion():void {
  this.refrescarListaSubject.next();
}

  getCervezas(): Observable<Cerveza[]> {
    return this.http.get<Cerveza[]>(this.url); 
  }

  agregarCerveza(cerveza:Cerveza): Observable<Cerveza[]> {
    return this.http.post<Cerveza[]>(this.url,cerveza); 
  }
}
