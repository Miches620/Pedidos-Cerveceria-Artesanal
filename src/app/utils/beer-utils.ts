import { Carrito } from "../models/cerveza/carrito.module";
import { Cerveza } from "../models/cerveza/cerveza.module";

//Compara 2 objetos y devuelve un true o false segun corresponda
export function sonIguales<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

//Busca en una lista si hay coincidencias entre el nombre de algun objeto y el input nuevo
export function encontrarCervezaRepetida(lista: Cerveza[], nombre: string): boolean {
  return lista.some(c => c.Nombre.toLowerCase() === nombre.toLowerCase());
}

//Toma el listado completo agrupado en tandas, y devuelve una unica lista con todos los elementos
function unificarTandas(tandas: Cerveza[][]): Cerveza[] {
  const tandaUnificada: Cerveza[] = []
  tandas.forEach((tanda) => tandaUnificada.push(...tanda))
  return tandaUnificada;
}

//toma una lista unificada y realiza filtrado segun criterio y value en el input de busqueda, devuelve una Matriz luego de utilizar organizarCarousel()
function filtrosAvanzados(tandaUnificada: Cerveza[], criterio: keyof Cerveza, busqueda: string): Cerveza[][] {
  let resultado: Cerveza[] = []
  if (criterio === "Estilo") { resultado = tandaUnificada.filter(x => x[criterio].toLowerCase().includes(busqueda.toLowerCase())) }
  else { resultado = tandaUnificada.filter(x => x[criterio].toString().startsWith(busqueda)); }
  return organizarCarousel(resultado)
}

//recibe una lista unificada de cervezas y la convierte en una matriz de 4 elementos por lista
export function organizarCarousel(cerveza: Cerveza[]): Cerveza[][] {
  const tandas: Cerveza[][] = [];
  for (let i = 0; i < cerveza.length; i += 4) {
    tandas.push(cerveza.slice(i, i + 4));
  }
  return tandas;
}
//recibe un objeto Carrito o Cerveza, y 2 numeros. 1 para id y otro para cantidad. Crea y devuelve un objeto Carrito
export function actualizarArticuloCantidad(articulo: Carrito | Cerveza, index:number, cantidad: number): Carrito {
  return {
    id:index ,
    Nombre: articulo.Nombre,
    Estilo: articulo.Estilo,
    precio: articulo.precio,
    cantidad: cantidad,
  }
}

/**
 * Esta función asume que los valores del formulario vienen validados (form.valid === true).
 * Los campos marcados con "!" no pueden ser null ni undefined en este contexto.
 */

export function sanitizeCerveza(
  formValues: Partial<Cerveza>,
  originalCerveza?: Cerveza
): Cerveza {
  return {
    id: originalCerveza?.id ?? 0,
    Nombre: formValues.Nombre?.trim() || originalCerveza?.Nombre!,
    SRM: formValues.SRM ?? originalCerveza?.SRM!,
    Estilo: formValues.Estilo?.trim() || originalCerveza?.Estilo!,
    IBU: formValues.IBU ?? originalCerveza?.IBU!,
    ABV: formValues.ABV ?? originalCerveza?.ABV!,
    img: formValues.img === null || formValues.img === ''
      ? originalCerveza?.img ?? "assets/cervezas/CervezaRandom.jpg"
      : "assets/cervezas/" + formValues.img?.substring(12),
    info: formValues.info?.trim() === ''
      ? originalCerveza?.info ?? "No hay descripción disponible."
      : formValues.info!,
    precio: formValues.precio ?? originalCerveza?.precio!,
    fav: originalCerveza?.fav ?? false
  };
}
