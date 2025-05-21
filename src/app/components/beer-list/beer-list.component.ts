
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CervezaService } from '../../services/cerveza.service';
import { Cerveza } from '../../models/cerveza/cerveza.module';
import { NgFor, NgIf, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-beer-list',
  imports: [NgFor, NgIf, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './beer-list.component.html',
  styleUrl: './beer-list.component.css'
})
export class BeerListComponent implements OnInit, OnDestroy {

  //Variables de almacenamiento de base de datos
  cervezas: Cerveza[] = [];
  cervezasFiltradas: Cerveza[] = [];
  estilos: string[] = [];

  //Declaracion del FormGroup para manipular datos del formulario
  nuevaCerveza: FormGroup;

  //Variables modificadoras del modal POST - UPDATE
  edicion: boolean = false;
  tituloModal: string = "";
  botonModal: string = "";
  returnIMG: string = "";
  returnInfo: string = "";

  //Variables modificadoras del modal DELETE + modal UPDATE
  nombreDeCervezaSeleccionada: string = "";
  estiloDeCervezaSeleccionada: string = "";
  idDeCervezaSeleccionada: number = -1;

  constructor(private serviceCerveza: CervezaService, private crearCerveza: FormBuilder) {
    this.nuevaCerveza = this.crearCerveza.group({
      cervezaNombre: ['', [Validators.required, Validators.minLength(1)]],
      cervezaSRM: ['', [Validators.required, Validators.min(1), Validators.max(50)]],
      cervezaEstilo: ['', Validators.required],
      cervezaIBU: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      cervezaABV: ['', [Validators.required, Validators.min(0), Validators.max(90)]],
      cervezaIMG: [''],
      cervezaInfo: ['', [Validators.minLength(20), Validators.maxLength(280)]]
    });
  }

  ngOnInit(): void {

    this.serviceCerveza.getEstilos().subscribe((data) => {
      this.estilos = data.sort();
    })
    this.obtenerCervezas();

  }

  ngOnDestroy(): void { }

  //*****Getters del Formulario*****************************************************************************************************************

  get cNNombre() {
    return this.nuevaCerveza.get('cervezaNombre');
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

  //********************************************************************************************************************************************

  //*****Visualizacion del listado de Cervezas**************************************************************************************************

  obtenerCervezas(): void {
    this.serviceCerveza.getCervezas().subscribe((data) => {
      data.map(x => x.info?.replace(/\s/g, " "))
      this.cervezas = data;
      this.cervezasFiltradas = data;
    });
  }

  filtrarPor(atributo: keyof Cerveza | ""): Cerveza[] {
    atributo ?
      this.cervezasFiltradas = [...this.cervezas].sort((a, b) => {
        const valorA = a[atributo];
        const valorB = b[atributo];
        return Number(valorA) - Number(valorB)
      }) : this.cervezasFiltradas = [...this.cervezas].sort((a, b) => a.estilo.localeCompare(b.estilo));
    return this.cervezasFiltradas
  }

  //- ¿Qué pasa si no hay registros que coincidan con los criterios de búsqueda?
  //- ¿Qué pasa si la búsqueda devuelve un conjunto de resultados muy grande y necesita ser paginado?
  //- ¿Qué pasa si el usuario solicita un registro que no existe?
  //- ¿Qué pasa si la consulta es muy compleja y requiere de índices o optimizaciones adicionales?

  //********************************************************************************************************************************************

  //*****Crear Nueva Cerveza********************************************************************************************************************

  crearNuevaCerveza(): Cerveza {

    const idNuevaCerveza = 0;
    const nCerveza: Cerveza = {
      id: idNuevaCerveza,
      nombre: this.cNNombre?.value,
      SRM: this.cNSRM?.value,
      estilo: this.cNEstilo?.value,
      ibu: this.cNIBU?.value,
      alcohol: this.cNAVB?.value,
      img: this.cNIMG?.value === null ? "assets/cervezas/CervezaRandom.jpg" : "assets/cervezas/" + this.cNIMG?.value.substring(12),
      info: this.cNInfo?.value === null ? "No hay descripcion disponible." : this.cNInfo?.value
    }
    return nCerveza;
  }

  agregarNuevaCerveza() {
    this.nuevaCerveza.valid ?
      this.serviceCerveza.postCerveza(this.crearNuevaCerveza()).subscribe({
        next: () => {
          this.funcionExitosa();
        },
        error: (e) => {
          alert("Error al intentar añadir una nueva cerveza al listado. Por favor intenta nuevamente. " + e)
        }
      })
      :
      this.nuevaCerveza.markAllAsTouched();
  }

  //- ¿Qué pasa si el usuario no proporciona todos los campos obligatorios? : RESUELTO
  //- ¿Qué pasa si el usuario proporciona datos inválidos? : RESUELTO
  //- ¿Qué pasa si el registro repetido no es exactamente igual, pero sí muy similar (por ejemplo, mismo nombre pero diferente mayúscula/minúscula)?
  //- ¿Qué pasa si el usuario intenta crear un registro con un ID que ya existe? : RESUELTO, AUNQUE HAY QUE CHECKEAR
  //- ¿Qué pasa si el formulario tiene campos con valores por defecto que deben ser validados? : RESUELTO

  //********************************************************************************************************************************************

  //*****Editar Cerveza*************************************************************************************************************************

  prepararEdicion(cerveza: Cerveza) {
    this.mostrarModal("editar");
    this.cNNombre?.setValue(cerveza.nombre);
    this.cNSRM?.setValue(cerveza.SRM);
    this.cNEstilo?.setValue(cerveza.estilo);
    this.cNIBU?.setValue(cerveza.ibu);
    this.cNAVB?.setValue(cerveza.alcohol);
    this.cNInfo?.setValue(cerveza.info);
    this.idDeCervezaSeleccionada = cerveza.id
  }

  editarCerveza() {
    const cervezaID: Cerveza | undefined = this.cervezas.find(x => x.id === this.idDeCervezaSeleccionada);

    if (cervezaID) {
      const eCerveza: Cerveza = {
        id: this.idDeCervezaSeleccionada,
        nombre: this.cNNombre?.value !== cervezaID.nombre ? this.cNNombre?.value : cervezaID.nombre,
        SRM: this.cNSRM?.value !== cervezaID.SRM ? this.cNSRM?.value : cervezaID.SRM,
        estilo: this.cNEstilo?.value !== cervezaID.estilo ? this.cNEstilo?.value : cervezaID.estilo,
        ibu: this.cNIBU?.value !== cervezaID.ibu ? this.cNIBU?.value : cervezaID.ibu,
        alcohol: this.cNAVB?.value !== cervezaID.alcohol ? this.cNAVB?.value : cervezaID.alcohol,
        img: this.cNIMG?.value === null ? cervezaID.img : this.cNIMG?.value,
        info: this.cNInfo?.value !== cervezaID.info ? this.cNInfo?.value : cervezaID.info
      }

      this.sonIguales(cervezaID, eCerveza) ? alert("Ningun cambio detectado en los datos de la cerveza")
        :
        this.serviceCerveza.updateCerveza(eCerveza, this.idDeCervezaSeleccionada).subscribe({
          next: () => {
            this.funcionExitosa();
          },
          error: (e) => {
            alert("Error al intentar editar la cerveza seleccionada. Por favor intenta nuevamente. " + e)
          }
        })
    }
  }

  //********************************************************************************************************************************************

  //*****Borrar Cerveza*************************************************************************************************************************

  ultimarCerveza(cerveza: Cerveza) {
    this.nombreDeCervezaSeleccionada = cerveza.nombre
    this.estiloDeCervezaSeleccionada = cerveza.estilo
    this.idDeCervezaSeleccionada = cerveza.id
  }

  borrarCerveza(id: number) {
    this.serviceCerveza.deleteCerveza(id).subscribe({
      next: () => {
        this.ngOnInit();
        document.getElementById("cerrarModalBorrar")?.click();
        this.nombreDeCervezaSeleccionada = ""
        this.estiloDeCervezaSeleccionada = ""
        this.idDeCervezaSeleccionada = -1;
      },
      error: (e) => {
        alert("Error al intentar borrar la cerveza seleccionada. Por favor intenta nuevamente. " + e);
      }
    })
  }

  //- ¿Qué pasa si el usuario intenta eliminar un registro que no existe? : RESUELTO, SE TOMA ID COMO ENTRADA DE LA FUNCION
  //- ¿Qué pasa si el registro que se intenta eliminar tiene dependencias con otros registros (por ejemplo, un pedido que tiene items asociados)?

  //********************************************************************************************************************************************

  //*****Funciones Auxiliares*******************************************************************************************************************

  limpiarFormulario() {
    this.nuevaCerveza.reset();
  }

  mostrarModal(accion: string) {
    accion === "crear" ?
      (this.limpiarFormulario(),
        this.tituloModal = "Agregar Nueva Cerveza",
        this.edicion = false)
      :
      (this.limpiarFormulario(),
        this.tituloModal = "Editar Cerveza",
        this.edicion = true)
  }

  funcionExitosa() {
    this.ngOnInit();
    this.nuevaCerveza.reset();
    document.getElementById("cerrarModal")?.click();
  }

  sonIguales(cerveza1: Cerveza, cerveza2: Cerveza): boolean {
    return JSON.stringify(cerveza1) === JSON.stringify(cerveza2);
  }

  //********************************************************************************************************************************************
}
