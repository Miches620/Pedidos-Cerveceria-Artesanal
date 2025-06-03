import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Carrito } from '../../models/cerveza/carrito.module';
import { CarritoService } from '../../services/carrito.service';
import { NgFor, NgIf } from '@angular/common';
import { ModalsComponent } from '../modals/modals.component';
import { Cerveza } from '../../models/cerveza/cerveza.module';
import { SharedEventService } from '../../services/shared-event.service';
import { actualizarArticuloCantidad } from '../../utils/beer-utils';



@Component({
  selector: 'app-carrito',
  imports: [NgIf, NgFor, ModalsComponent],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit, OnDestroy {

  @ViewChild(ModalsComponent, { static: true })
  modal!: ModalsComponent;

  ngOnDestroy(): void { }

  ngOnInit(): void {

    this.actualizarCarrito();

    this.sharedEvent.cervezaSeleccionada$.subscribe(cerveza => { this.agregaralCarrito(cerveza); this.contadorCarrito++; });

  }

  constructor(private serviceCarrito: CarritoService, private sharedEvent: SharedEventService) { }

  showModalCarrito: boolean = false; //Variable de acceso al modal mediante NgIf
  carritoDelUsuario: Carrito[] = [] //Almacena el get del listado de articulos.
  totalCarrito: number = 0; //Almacena la sumatoria de todos los precios de los articulos del carrito.
  contadorCarrito: number = 0; //Almacena la sumatoria de todos los articulos del carrito (sumando sus cantidades).


  //*****Apertura de Carrito********************************************************************************************************************

  openModalCarrito() {
    if (this.contadorCarrito > 0) { this.showModalCarrito = true }
  }


  closeModalCarrito() {
    this.showModalCarrito = false;
  }

  //********************************************************************************************************************************************

  //*****Crear Nuevo Carrito********************************************************************************************************************

  agregaralCarrito(cerveza: Cerveza) {

    const articulo = actualizarArticuloCantidad(cerveza, 0, 1);

    let id: number = 0;

    const repetido = this.carritoDelUsuario.some(cerveza => cerveza.Nombre === articulo.Nombre);

    !repetido ?

      this.serviceCarrito.postCarrito(articulo).subscribe({
        next: () => {
          this.actualizarCarrito();
        },
        error: (e) => {
          console.error('Error al hacer POST:', e);
          const msg = e?.error?.message || e.message || 'Error desconocido';
          this.modal.openModalError(
            `No se pudo agregar ${articulo.Nombre} al carrito.\nDetalles: ${msg}`,
            false
          );
        }
      })
      :
      id = this.encontrarID(articulo)
    this.editarCantidad("suma", id);
  }

  //********************************************************************************************************************************************

  //*****Editar Carrito*************************************************************************************************************************

  editarCantidad(accion: string, id: number) {
    const cerveza = this.encontrarArticulo(id);

    if (cerveza) {

      let valor = cerveza.cantidad

      accion === "resta" ?
        //_____________________  
        cerveza.cantidad > 1 ?
          valor -= 1
          :
          valor
        //_____________________  
        :
        valor += 1;

      const articulo = actualizarArticuloCantidad(cerveza, cerveza.id, valor)

      this.serviceCarrito.updateCarrito(articulo, id).subscribe({
        next: () => {
          this.actualizarCarrito();
        },
        error: (e) => {
          this.modal.openModalError("Error al intentar actualizar tu carrito. Por favor intenta nuevamente. " + e, true)
        }
      })
    }
  }

  //********************************************************************************************************************************************

  //*****Borrar Carrito*************************************************************************************************************************

  borrarArticulo(id: number) {
    const cerveza = this.encontrarArticulo(id);
    if (cerveza) {
      this.serviceCarrito.deleteCarrito(id).subscribe({
        next: () => {
          this.actualizarCarrito();
        },
        error: (e) => {
          this.modal.openModalError("Error al intentar borrar la cerveza. Por favor intenta nuevamente. " + e, true)
        }
      })
    }
  }

  //********************************************************************************************************************************************

  //*****Funciones Auxiliares*******************************************************************************************************************

  encontrarArticulo(id: number): Carrito | undefined {
    return this.carritoDelUsuario.find(x => x.id === id)
  }

  encontrarID(cerveza: Carrito): number {
    const articulo = this.carritoDelUsuario.find(x => x.Nombre === cerveza.Nombre);
    if (articulo) { return articulo.id } else { return 0 }
  }

  calcularTotal(): number {
    const total: number = this.carritoDelUsuario.reduce((acc, cerveza) => {
      return acc + (cerveza.precio * cerveza.cantidad)
    }, 0)
    return total;
  }

  calcularExistencias(): number {
    const existencias: number = this.carritoDelUsuario.reduce((acc, cerveza) => {
      return acc += cerveza.cantidad
    }, 0)
    return existencias
  }

  actualizarCarrito() {
    this.serviceCarrito.getCarrito().subscribe((data) => {
      this.carritoDelUsuario = data;
      this.totalCarrito = this.calcularTotal();
      this.contadorCarrito = this.calcularExistencias();
      this.sharedEvent.actualizarContador(this.contadorCarrito);
    });
  }

  //********************************************************************************************************************************************

}
