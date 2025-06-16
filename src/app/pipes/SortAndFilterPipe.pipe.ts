import { Pipe, PipeTransform } from '@angular/core';
import { Cerveza } from '../models/cerveza/cerveza.module';
import { organizarCarousel } from '../utils/beer-utils';

@Pipe({
  name: 'sortAndFilter',
  pure: true
})
export class SortAndFilterPipe implements PipeTransform {

  transform(
    cervezas: Cerveza[][],
    atributo: keyof Cerveza | "",
    busqueda: string,
    notificarCoincidencias?: (hayCoincidencias: boolean) => void
  ): Cerveza[][] {
    if (!cervezas) return [];

    // Paso 1: Unificar todas las tandas en una sola lista
    const todas = cervezas.flat();

    // Paso 2: Ordenar por atributo (si hay)
    let ordenadas = [...todas];
    if (atributo) {
      ordenadas = ordenadas.sort((a, b) => {
        const valorA = a[atributo];
        const valorB = b[atributo];
        return typeof valorA === "string"
          ? valorA.localeCompare(valorB as string)
          : Number(valorA) - Number(valorB);
      });
    } else {
      ordenadas = ordenadas.sort((a, b) => a.Estilo.localeCompare(b.Estilo));
    }

    // Paso 3: Filtrar por búsqueda
    const filtradas = ordenadas.filter(cerveza => {
      const valor = cerveza[atributo || "Estilo"];
      if (typeof valor === "string") {
        return valor.toLowerCase().includes(busqueda.toLowerCase());
      }
      return valor.toString().startsWith(busqueda);
    });

    notificarCoincidencias?.(filtradas.length > 0);

    // Paso 4: Reagrupar para el carousel
    return organizarCarousel(filtradas);
  }
}