
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CervezaService } from '../../services/cerveza.service';
import { Cerveza } from '../../models/cerveza/cerveza.module';
import { NgClass, NgFor, NgIf, NgOptimizedImage } from '@angular/common';
import { ModalsComponent } from '../modals/modals.component';
import { encontrarCervezaRepetida, organizarCarousel, sonIguales, sanitizeCerveza } from '../../utils/beer-utils';
import { SharedEventService } from '../../services/shared-event.service';
import { CarritoComponent } from '../carrito/carrito.component';
import { Usuario } from '../../models/cerveza/usuario.module';
import { SortAndFilterPipe } from "../../pipes/SortAndFilterPipe.pipe";
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-beer-list',
  imports: [FormsModule, NgClass, NgFor, NgIf, ReactiveFormsModule, NgOptimizedImage, ModalsComponent, CarritoComponent, SortAndFilterPipe],
  templateUrl: './beer-list.component.html',
  styleUrl: './beer-list.component.css'
})
export class BeerListComponent implements OnInit, OnDestroy {

  @ViewChild('buscador', { static: true })
  buscardorInput!: ElementRef<HTMLInputElement>;

  @ViewChild('cerrarBtn', { static: true })
  cerrarBtnModal!: ElementRef<HTMLButtonElement>;

  @ViewChild('cerrarBtnBorrar', { static: true })
  cerrarBtnBorrar!: ElementRef<HTMLButtonElement>;

  @ViewChild('btnfavoritos', { static: true })
  btnfavoritos!: ElementRef<HTMLButtonElement>;

  @ViewChild(ModalsComponent, { static: false })
  modal!: ModalsComponent;

  @ViewChild(CarritoComponent, { static: false })
  carrito!: CarritoComponent;

  //Favoritos
  favs: boolean = false;
  favoritos: Cerveza[] = [];
  filtroFavoritos: boolean = false;
  OnFavoritos: boolean = false;

  //Variables de almacenamiento de base de datos
  cervezas: Cerveza[] = [];
  cervezasFiltradas: Cerveza[] = [];
  estilos: string[] = [];

  //Declaracion del FormGroup para manipular datos del formulario
  nuevaCerveza: FormGroup;

  //Variables modificadoras del modal POST - UPDATE
  edicion: boolean = false;
  tituloModal: string = "";

  //Variables modificadoras del modal DELETE + modal UPDATE
  nombreDeCervezaSeleccionada: string = "";
  estiloDeCervezaSeleccionada: string = "";
  idDeCervezaSeleccionada: number = -1;

  //Variables para filtros y busqueda
  noMatch: boolean = false;
  criterio: keyof Cerveza = "Estilo"
  busqueda = new FormControl('');
  busquedaFiltrada: string = '';

  criteriosDeOrdenamiento = [
    { label: 'Estilo', value: 'Estilo' },
    { label: 'Color', value: 'SRM' },
    { label: 'Amargor', value: 'IBU' },
    { label: 'Alcohol', value: 'ABV' }
  ];

  //Variable de Carousel:
  tandas: Cerveza[][] = []

  //Variable contador del Carrito
  elementosEnCarrito: number = 0;

  //Variables de Usuarios **ESTO ES PROVISORIO. A futuro Login tendra su propio componente.
  usuarioProv: Usuario[] = [];
  isLogin: boolean = false;
  nombreDeUsuario: string = "";
  administrador: string = "";
  //Admin-User
  modoAdmin: boolean = false;
  modoUser: boolean = false;

  constructor(private serviceCerveza: CervezaService, private crearCerveza: FormBuilder, private sharedEvent: SharedEventService, private cdr: ChangeDetectorRef) {
    this.nuevaCerveza = this.crearCerveza.group({
      Nombre: ['', [Validators.required, Validators.minLength(1)]],
      SRM: ['', [Validators.required, Validators.min(1), Validators.max(50)]],
      Estilo: ['', Validators.required],
      IBU: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      ABV: ['', [Validators.required, Validators.min(0), Validators.max(90)]],
      img: [''],
      info: ['', [Validators.minLength(20), Validators.maxLength(280)]],
      precio: ['', [Validators.required, Validators.min(0), Validators.max(50000)]]
    });
  }

  ngOnInit(): void {

    this.busqueda.valueChanges
      .pipe(debounceTime(300))
      .subscribe(valor => this.procesarBusqueda(valor!));

    this.buscardorInput.nativeElement.placeholder = "Estilo";

    this.noMatch = false;

    this.obtenerEstilos();

    this.obtenerCervezas();

    this.filtrarFavoritos();

    this.obtenerUsuarios();//Provisorio con la unica finalidad de enseñar las opciones de user o admin

    this.sharedEvent.contador$.subscribe(contador => { this.elementosEnCarrito = contador })

  }

  ngOnDestroy(): void { }

  //*****Getters del Formulario*****************************************************************************************************************

  // Getters usados en las validaciones del HTML para acceder fácilmente a los controles del formulario

  get formNombre() {
    return this.nuevaCerveza.get('Nombre');
  }

  get formColor() {
    return this.nuevaCerveza.get('SRM');
  }

  get formEstilo() {
    return this.nuevaCerveza.get('Estilo');
  }

  get formIBU() {
    return this.nuevaCerveza.get('IBU');
  }

  get formAlcohol() {
    return this.nuevaCerveza.get('ABV');
  }

  get formImagen() {
    return this.nuevaCerveza.get('img');
  }

  get formInfo() {
    return this.nuevaCerveza.get('info');
  }

  get formPrecio() {
    return this.nuevaCerveza.get('precio');
  }

  //********************************************************************************************************************************************

  //*****Visualizacion del listado de Cervezas**************************************************************************************************

  private obtenerCervezas(): void {
    this.serviceCerveza.getCervezas().subscribe((data) => {
      this.cervezas = data;
      this.cervezasFiltradas = data;
    });
  }

  private obtenerEstilos(): void {
    this.serviceCerveza.getEstilos().subscribe((data) => {
      this.estilos = data.sort();
    })
  }

  private OrdenarPor(atributo: keyof Cerveza | ""): void {
    this.criterio = atributo || "Estilo";
  }

  private procesarBusqueda(valor: string): void {
    this.busquedaFiltrada = valor?.trim().toLowerCase() || "";

    const todas = this.tandas?.flat() || [];

    const atributo = this.criterio || "Estilo";

    const filtradas = todas.filter(cerveza => {
      const valorCerveza = cerveza[atributo];
      return valorCerveza?.toString().toLowerCase().includes(this.busquedaFiltrada);
    });

    this.noMatch = filtradas.length === 0;
  }

  //********************************************************************************************************************************************

  //*****Crear Nueva Cerveza********************************************************************************************************************

  private crearNuevaCerveza(): Cerveza {
    const nCerveza: Cerveza = sanitizeCerveza(this.nuevaCerveza.value);
    return nCerveza;
  }

  agregarNuevaCerveza() {

    let nCerveza;

    this.nuevaCerveza.valid ?

    (nCerveza = this.crearNuevaCerveza(),

      !encontrarCervezaRepetida(this.cervezas, nCerveza.Nombre) ?

        this.serviceCerveza.postCerveza(this.crearNuevaCerveza()).subscribe({
          next: () => {
            this.funcionExitosa();
          },
          error: (e) => {
            this.modal.openModalError("Error al intentar añadir una nueva cerveza al listado. Por favor intenta nuevamente. " + JSON.stringify(e), false);
          }
        })
        :
        this.modal.openModalError("Ya existe una cerveza registrada con ese nombre.", true)
      )
      :
      this.nuevaCerveza.markAllAsTouched();
  }

  //********************************************************************************************************************************************

  //*****Editar Cerveza*************************************************************************************************************************

  prepararEdicion(cerveza: Cerveza) {
    this.mostrarModal("editar");
      this.nuevaCerveza.patchValue({
      Nombre: cerveza.Nombre,
      SRM: cerveza.SRM,
      Estilo: cerveza.Estilo,
      IBU: cerveza.IBU,
      ABV: cerveza.ABV,
      info: cerveza.info,
      precio: cerveza.precio
    })
    this.idDeCervezaSeleccionada = cerveza.id
  }

  editarCerveza() {

    const cervezaID: Cerveza | undefined = this.cervezas.find(x => x.id === this.idDeCervezaSeleccionada);
    let eCerveza;

    if (cervezaID) {
      if(this.nuevaCerveza.valid){
      eCerveza = sanitizeCerveza(this.nuevaCerveza.value, cervezaID);
      
      sonIguales(cervezaID, eCerveza) ?
        (this.funcionExitosa()
          , this.modal.openModalError("Ningún cambio detectado en los datos de la cerveza.", true))
        :
        this.serviceCerveza.updateCerveza(eCerveza, this.idDeCervezaSeleccionada).subscribe({
          next: () => {
            this.funcionExitosa();
          },
          error: (e) => {
            this.modal.openModalError("Error al intentar editar la cerveza seleccionada. Por favor intenta nuevamente. " + JSON.stringify(e), false);
          }
        })
      }
    }
  }

  //********************************************************************************************************************************************

  //*****Borrar Cerveza*************************************************************************************************************************

  ultimarCerveza(cerveza: Cerveza) {
    this.nombreDeCervezaSeleccionada = cerveza.Nombre
    this.estiloDeCervezaSeleccionada = cerveza.Estilo
    this.idDeCervezaSeleccionada = cerveza.id
    this.modal.openModalBorrar(cerveza.id, cerveza.Nombre, cerveza.Estilo);
  }

  borrarCerveza(id: number) {
    this.serviceCerveza.deleteCerveza(id).subscribe({
      next: () => {
        this.obtenerCervezas();
        this.cerrarBtnBorrar.nativeElement.click();
        this.nombreDeCervezaSeleccionada = ""
        this.estiloDeCervezaSeleccionada = ""
        this.idDeCervezaSeleccionada = -1;
      },
      error: (e) => {
        this.modal.openModalError("Error al intentar borrar la cerveza seleccionada. Por favor intenta nuevamente. " + JSON.stringify(e), false);
      }
    })
  }

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

  private funcionExitosa() {
    this.ngOnInit();
    this.nuevaCerveza.reset();
    this.cerrarBtnModal.nativeElement.click();
  }

  agregarFavoritos(cerveza: Cerveza) {
    this.favoritos.push(cerveza);
    cerveza.fav = true;
  }

  quitarDeFavoritos(cerveza: Cerveza) {
    this.favoritos = this.favoritos.filter(x => x !== cerveza);
    cerveza.fav = false;
    if (this.favoritos.length === 0) { this.filtroFavoritos = false; this.filtrarFavoritos(); this.OnFavoritos = false }
  }

  agregarAlCarrito(cerveza: Cerveza) {
    this.sharedEvent.emitirCervezaSeleccionada(cerveza);
  }

  verTusFavoritos() {
    this.OnFavoritos = !this.OnFavoritos
    const favoritos = organizarCarousel(this.favoritos)

    this.OnFavoritos === false ? this.tandas = organizarCarousel(this.cervezas)
      :
      this.tandas = favoritos,
      this.buscardorInput.nativeElement.value = ""
  }

  private filtrarFavoritos() {
    !this.filtroFavoritos ?
      this.tandas = organizarCarousel(this.cervezas) :
      this.tandas = organizarCarousel(this.favoritos);
  }

  abrirCarrito() {
    this.carrito.openModalCarrito()
  }

  login() {
    this.modal.openModalLogin();
  }

  loginIn(event: boolean) { //Provisorio con fines demostrativos. A futuro: componente login con toda su logica y CRUD.

    if (event) {

      const userLogin = this.modal.getUser()?.value;
      const passLogin = this.modal.getPass()?.value;

      const login = this.usuarioProv.find(x => x.user === userLogin && x.pass === passLogin)

      if (login) {
        this.isLogin = true;
        if (login.user === "Comprador") { this.modoUser = true; this.nombreDeUsuario = login.user; this.modoAdmin = false; }
        else { this.modoAdmin = true; this.administrador = login.user; this.modoUser = false; }
      } else { this.modal.openModalError("Usuario y/o Contraseña incorrecta.", true) }

    }
  }

  logOut() {
    this.modoAdmin = false;
    this.modoUser = false;
    this.isLogin = false;
    this.nombreDeUsuario = "";
    this.administrador = "";
    this.ngOnInit();
  }

  private obtenerUsuarios() { //Provisorio. Entiendo la gravedad de exponer las credenciales de esta forma. Es solo con fines demostrativos.
    this.serviceCerveza.getUsers().subscribe((data) => {
      this.usuarioProv = data
    });
  }

  //********************************************************************************************************************************************
}
