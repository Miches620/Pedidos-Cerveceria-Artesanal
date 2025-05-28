import { Cerveza } from "../models/cerveza/cerveza.module";
import { debounce } from "lodash";

export function sonIguales<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function encontrarCervezaRepetida(lista: Cerveza[], nombre: string): boolean {
  return lista.some(c => c.Nombre.toLowerCase() === nombre.toLowerCase());
}

export function ordenarCervezas(
  cervezas: Cerveza[], 
  atributo: keyof Cerveza | ""
): Cerveza[] {
  if (!atributo) {
    return [...cervezas].sort((a, b) => a.Estilo.localeCompare(b.Estilo));
  }

  return [...cervezas].sort((a, b) => {
    const valorA = a[atributo];
    const valorB = b[atributo];
    return Number(valorA) - Number(valorB);
  });
}

export const filtrarCervezas = debounce((
  cervezas: Cerveza[],
  criterio: keyof Cerveza,
  busqueda: string,
  callback: (resultado : Cerveza[]) => void
) => {
  let resultado: Cerveza[];
  if (criterio === 'Estilo') {
    resultado = cervezas.filter(x => x[criterio].toLowerCase().includes(busqueda.toLowerCase()));
  } else{
    resultado = cervezas.filter(x => x[criterio].toString().startsWith(busqueda));
  }
callback(resultado)
},200);