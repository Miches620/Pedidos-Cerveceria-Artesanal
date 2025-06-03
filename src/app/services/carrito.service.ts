import { Injectable } from '@angular/core';
import { Carrito } from '../models/cerveza/carrito.module';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private url: string = "http://localhost:3000/"

  constructor(private http: HttpClient) { }

  getCarrito(): Observable<Carrito[]> {
    return this.http.get<Carrito[]>(this.url + "Carrito");
  }

  postCarrito(carrito: Carrito): Observable<Carrito[]> {
    return this.http.post<Carrito[]>(this.url + "Carrito", carrito);
  }

  updateCarrito(carrito: Carrito, id:number):Observable<Carrito[]> {
    return this.http.put<Carrito[]>(this.url + "Carrito/" + id,carrito);
  }

  deleteCarrito(id: number): Observable<void> {
    return this.http.delete<void>(this.url + "Carrito/" + id);
  }

}