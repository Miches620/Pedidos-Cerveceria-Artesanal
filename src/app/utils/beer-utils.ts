import { Carrito } from "../models/cerveza/carrito.module";
import { Cerveza } from "../models/cerveza/cerveza.module";
import { debounce } from "lodash";

//Compara 2 objetos y devuelve un true o false segun corresponda
export function sonIguales<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

//Busca en una lista si hay coincidencias entre el nombre de algun objeto y el input nuevo
export function encontrarCervezaRepetida(lista: Cerveza[], nombre: string): boolean {
  return lista.some(c => c.Nombre.toLowerCase() === nombre.toLowerCase());
}

//Recibe una tanda de cervezas y las ordena segun el criterio del atributo.
export function ordenarCervezas(
  cervezas: Cerveza[][],
  atributo: keyof Cerveza | ""
): Cerveza[] {

  const tandasUnificadas = unificarTandas(cervezas)
  if (!atributo) {
    return [...tandasUnificadas].sort((a, b) => a.Estilo.localeCompare(b.Estilo));
  }

  return [...tandasUnificadas].sort((a, b) => {
    const valorA = a[atributo];
    const valorB = b[atributo];
    return Number(valorA) - Number(valorB);
  });
}

//Filtra los resultados de busqueda tomando en cuenta el value de busqueda y el criterio establecido en un select junto al buscador.
export const filtrarCervezas = debounce((
  tandas: Cerveza[][],
  criterio: keyof Cerveza,
  busqueda: string,
  callback: (tandasFiltrada: Cerveza[][]) => void
) => {

  const tandaUnificada = unificarTandas(tandas);

  const tandasFiltrada = filtrosAvanzados(tandaUnificada, criterio, busqueda);

  callback(tandasFiltrada)
}, 400);

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