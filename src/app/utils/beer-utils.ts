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
  callback: (tanda: Cerveza[][]) => void
) => {
  let resultado: Cerveza[];
  if (criterio === "Estilo") {
    resultado = cervezas.filter(x => x[criterio].toLowerCase().includes(busqueda.toLowerCase()));
  } else {
    resultado = cervezas.filter(x => x[criterio].toString().startsWith(busqueda));
  }
  const tanda = organizarCarousel(resultado)
  callback(tanda)
}, 400);

/*export function pulsarBackspace(input: HTMLInputElement) {

  const event = new KeyboardEvent('keydown', {
    key: 'Backspace',
    code: 'Backspace',
    keyCode: 8,
    which: 8,
    bubbles: true,
    cancelable: true,
  });

  input.dispatchEvent(event);
}*/


export function organizarCarousel(cerveza:Cerveza[]): Cerveza[][] {
  const tandas: Cerveza[][] = [];
  for (let i = 0; i < cerveza.length; i += 4) {
    tandas.push(cerveza.slice(i, i + 4));
  }
  return tandas;
}