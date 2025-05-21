import { Injectable } from '@angular/core';
import { Cerveza } from '../models/cerveza/cerveza.module';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CervezaService {

  private url: string = "http://localhost:3000/"

  constructor(private http: HttpClient) { }

  getCervezas(): Observable<Cerveza[]> {
    return this.http.get<Cerveza[]>(this.url + "cervezas");
  }

  getEstilos(): Observable<string[]> {
    return this.http.get<string[]>(this.url + "estilos")
  }

  postCerveza(cerveza: Cerveza): Observable<Cerveza[]> {
    return this.http.post<Cerveza[]>(this.url + "cervezas", cerveza);
  }

  updateCerveza(cerveza: Cerveza, id:number):Observable<Cerveza[]> {
    return this.http.put<Cerveza[]>(this.url + "cervezas/" + id,cerveza);
  }

  deleteCerveza(id: number): Observable<void> {
    return this.http.delete<void>(this.url + "cervezas/" + id);
  }

}
