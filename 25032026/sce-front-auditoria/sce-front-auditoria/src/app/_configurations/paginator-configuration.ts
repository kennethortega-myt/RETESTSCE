import { Injectable } from "@angular/core";
import { MatPaginatorIntl } from "@angular/material/paginator";

@Injectable()
export class PaginatorConfiguration extends MatPaginatorIntl {


  showPlus : boolean = false;

  constructor() {
    super();
    this.nextPageLabel = ' siguiente';
    this.previousPageLabel = ' anterior';
    this.itemsPerPageLabel = 'Registros por página';
    this.lastPageLabel = 'última página';
    this.firstPageLabel = 'primera página'
  }


  override getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) { return `0 de ${length}`; }

      length = Math.max(length, 0);

      const startIndex = page * pageSize;
      const endIndex = startIndex < length ?
          Math.min(startIndex + pageSize, length) :
          startIndex + pageSize;

      return `${startIndex + 1} - ${endIndex} de ${length}${this.showPlus ? '+' : ''}`;
    }
}
