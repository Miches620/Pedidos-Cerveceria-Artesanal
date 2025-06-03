
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CervezaService } from '../../services/cerveza.service';
import { Cerveza } from '../../models/cerveza/cerveza.module';
import { NgClass, NgFor, NgIf, NgOptimizedImage } from '@angular/common';
import { ModalsComponent } from '../modals/modals.component';
import { encontrarCervezaRepetida, filtrarCervezas, ordenarCervezas, organizarCarousel, sonIguales } from '../../utils/beer-utils';
import { SharedEventService } from '../../services/shared-event.service';
import { CarritoComponent } from '../carrito/carrito.component';
import { Usuario } from '../../models/cerveza/usuario.module';

@Component({
  selector: 'app-beer-list',
  imports: [NgClass, NgFor, NgIf, ReactiveFormsModule, NgOptimizedImage, ModalsComponent, CarritoComponent],
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

  constructor(private serviceCerveza: CervezaService, private crearCerveza: FormBuilder, private sharedEvent: SharedEventService) {
    this.nuevaCerveza = this.crearCerveza.group({
      cervezaNombre: ['', [Validators.required, Validators.minLength(1)]],
      cervezaSRM: ['', [Validators.required, Validators.min(1), Validators.max(50)]],
      cervezaEstilo: ['', Validators.required],
      cervezaIBU: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      cervezaABV: ['', [Validators.required, Validators.min(0), Validators.max(90)]],
      cervezaIMG: [''],
      cervezaInfo: ['', [Validators.minLength(20), Validators.maxLength(280)]],
      cervezaPrecio: ['', [Validators.required, Validators.min(0), Validators.max(50000)]]
    });
  }

  ngOnInit(): void {

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

  get formNombre() {
    return this.nuevaCerveza.get('cervezaNombre');
  }

  get formColor() {
    return this.nuevaCerveza.get('cervezaSRM');
  }

  get formEstilo() {
    return this.nuevaCerveza.get('cervezaEstilo');
  }

  get formIBU() {
    return this.nuevaCerveza.get('cervezaIBU');
  }

  get formAlcohol() {
    return this.nuevaCerveza.get('cervezaABV');
  }

  get formImagen() {
    return this.nuevaCerveza.get('cervezaIMG');
  }

  get formInfo() {
    return this.nuevaCerveza.get('cervezaInfo');
  }

  get formPrecio() {
    return this.nuevaCerveza.get('cervezaPrecio');
  }

  //********************************************************************************************************************************************

  //*****Visualizacion del listado de Cervezas**************************************************************************************************

  obtenerCervezas(): void {
    this.serviceCerveza.getCervezas().subscribe((data) => {
      this.cervezas = data;
      this.cervezasFiltradas = data;
    });
  }

  obtenerEstilos(): void {
    this.serviceCerveza.getEstilos().subscribe((data) => {
      this.estilos = data.sort();
    })
  }

  OrdenarPor(atributo: keyof Cerveza | ""): void {
    this.buscardorInput.nativeElement.value = "";
    this.buscardorInput.nativeElement.placeholder = atributo || "Estilo";

    this.cervezasFiltradas = ordenarCervezas(this.tandas, atributo);
    this.tandas = organizarCarousel(this.cervezasFiltradas);
  }


  buscar(event?: KeyboardEvent) {
    const tecla = event?.key;

    const busqueda = this.buscardorInput.nativeElement.value;
    const criterio = this.buscardorInput.nativeElement.placeholder as keyof Cerveza;

    const teclasExcluidas = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift', 'Control', 'Alt'];
    if (tecla && teclasExcluidas.includes(tecla)) return;

    busqueda === "" ?
      this.ngOnInit()
      :
      filtrarCervezas(this.tandas, criterio, busqueda, (resultado) => {
        this.tandas = resultado;
        this.noMatch = this.tandas.length === 0;
      })
  }

  //FAQ - READ
  //- ¿Qué pasa si no hay registros que coincidan con los criterios de búsqueda?
  //- R: Si la búsqueda no devuelve ningun registro, el usuario recibira la leyenda "No se encontraron coincidencias" (HMTL, linea 26).
  //- ¿Qué pasa si la búsqueda devuelve un conjunto de resultados muy grande y necesita ser paginado?
  //- R: Teniendo en cuenta la dimension asignada al proyecto, el máximo esperado en este tipo de sectores no sobrepasaria jamas los 50 estilos.
  //- ¿Qué pasa si el usuario solicita un registro que no existe?
  //- R: Aplica el mismo principio que en la primer pregunta, la linea 26 del HTML devolvera la leyenda "No se encontraron coincidencias".
  //- ¿Qué pasa si la consulta es muy compleja y requiere de índices o optimizaciones adicionales?
  //- R: La escala asignada al proyecto evita este tipo de consultas, por lo cual esta pregunta no aplica al proyecto en cuestion.

  //* La seccion de busqueda esta divida en 2 sectores:
  //  -La barra de busqueda (la cual interviene de forma eficaz todas las preguntas realizadas mas arriba).
  //  -El Selector de criterios de orden (que dispondra la lista segun determinados atributos de cada Cerveza)

  //********************************************************************************************************************************************

  //*****Crear Nueva Cerveza********************************************************************************************************************

  crearNuevaCerveza(): Cerveza {

    const idNuevaCerveza = 0;
    const nCerveza: Cerveza = {
      id: idNuevaCerveza,
      Nombre: this.formNombre?.value,
      SRM: this.formColor?.value,
      Estilo: this.formEstilo?.value,
      IBU: this.formIBU?.value,
      ABV: this.formAlcohol?.value,
      img: this.formImagen?.value === null ? "assets/cervezas/CervezaRandom.jpg" : "assets/cervezas/" + this.formImagen?.value.substring(12),
      info: this.formInfo?.value === null ? "No hay descripcion disponible." : this.formInfo?.value,
      precio: this.formPrecio?.value,
      fav: false
    }
    return nCerveza;
  }

  agregarNuevaCerveza() {
    const nCerveza = this.crearNuevaCerveza()

    this.nuevaCerveza.valid ?

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
      :
      this.nuevaCerveza.markAllAsTouched();
  }

  //FAQ - CREATE
  //- ¿Qué pasa si el usuario no proporciona todos los campos obligatorios?
  //- R:  this.nuevaCerveza.valid ? verifica si se cumplen los requisitos del formulario, en caso de no cumplirse se activan los Validators.
  //- ¿Qué pasa si el usuario proporciona datos inválidos?
  //- R: Cada input text/number tiene NgIf con condicionales a cumplir que responden a Validators asignados en la creacion del formGroup.
  //- ¿Qué pasa si el registro repetido no es exactamente igual, pero sí muy similar (ej: mismo nombre pero diferente mayúscula/minúscula)?
  //- R: Se agregó funcion encontrarRepetido(), que revisara si el nombre elegido ya fue ocupado en un registro anterior.*
  //  *Cabe aclarar que distintas cervezas pueden tener mismo color, mismo alcohol, mismos IBUS y ser diferentes estilos.
  //- ¿Qué pasa si el usuario intenta crear un registro con un ID que ya existe?
  //- R: Esto no es posible ya que la asignacion de IDs (en esta etapa sin backend) se genera sin intervencion del usuario.**
  //- **En una etapa mas avanzada (con Backend y base de datos, la base de datos se encargara de la gestion con autoincremento del campo ID).
  //- ¿Qué pasa si el formulario tiene campos con valores por defecto que deben ser validados?
  //- R: Todos los campos del formulario tienen Validators que verifican precisamente que los ingresos cumplan con determinados condicionales.

  //********************************************************************************************************************************************

  //*****Editar Cerveza*************************************************************************************************************************

  prepararEdicion(cerveza: Cerveza) {
    this.mostrarModal("editar");
    this.formNombre?.setValue(cerveza.Nombre);
    this.formColor?.setValue(cerveza.SRM);
    this.formEstilo?.setValue(cerveza.Estilo);
    this.formIBU?.setValue(cerveza.IBU);
    this.formAlcohol?.setValue(cerveza.ABV);
    this.formInfo?.setValue(cerveza.info);
    this.formPrecio?.setValue(cerveza.precio);
    this.idDeCervezaSeleccionada = cerveza.id
  }

  editarCerveza() {

    const cervezaID: Cerveza | undefined = this.cervezas.find(x => x.id === this.idDeCervezaSeleccionada);

    if (cervezaID) {
      const eCerveza: Cerveza = {
        id: this.idDeCervezaSeleccionada,
        Nombre: this.formNombre?.value !== cervezaID.Nombre ? this.formNombre?.value : cervezaID.Nombre,
        SRM: this.formColor?.value !== cervezaID.SRM ? this.formColor?.value : cervezaID.SRM,
        Estilo: this.formEstilo?.value !== cervezaID.Estilo ? this.formEstilo?.value : cervezaID.Estilo,
        IBU: this.formIBU?.value !== cervezaID.IBU ? this.formIBU?.value : cervezaID.IBU,
        ABV: this.formAlcohol?.value !== cervezaID.ABV ? this.formAlcohol?.value : cervezaID.ABV,
        img: this.formImagen?.value === null ? cervezaID.img : this.formImagen?.value,
        info: this.formInfo?.value !== cervezaID.info ? this.formInfo?.value : cervezaID.info,
        precio: this.formPrecio?.value !== cervezaID.precio ? this.formPrecio?.value : cervezaID.precio,
        fav: cervezaID.fav
      }

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

  //FAQ - DELETE
  //- ¿Qué pasa si el usuario intenta eliminar un registro que no existe?
  //- R: La funcion borrarCerveza() existe en cada Cerveza, lo que permite tomar su ID al momento en el que el usuario decide borrarla.
  //- ¿Qué pasa si el registro que se intenta eliminar tiene dependencias con otros registros (por ejemplo, un pedido que tiene items asociados)?
  //- R: (EN PROCESO)

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

  filtrarFavoritos() {
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
        if (login.user === "Comprador") { this.modoUser = true; this.nombreDeUsuario = login.user; this.modoAdmin=false;}
        else { this.modoAdmin = true; this.administrador = login.user; this.modoUser=false; }
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

  obtenerUsuarios() { //Provisorio. Entiendo la gravedad de exponer las credenciales de esta forma. Es solo con fines demostrativos.
    this.serviceCerveza.getUsers().subscribe((data) => {
      this.usuarioProv = data
    });
  }

  //********************************************************************************************************************************************
}
