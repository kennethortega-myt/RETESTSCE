import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { BusquedaElectoresService } from 'src/app/service/busqueda-electores.service';
import { PadronElectoralBusqueda } from 'src/app/interface/padronElectoralBusqueda.interface';
import { UtilityService } from 'src/app/helper/utilityService';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { PageResponse } from 'src/app/interface/pageResponse.interface';
import { PadronElectoralResponse } from 'src/app/interface/padronElectoralResponse.interface';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { SharedModule } from 'src/app/pages/shared/shared.module';

@Component({
  selector: 'app-busqueda-electores',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    SharedModule
  ],
  templateUrl: './busqueda-electores.component.html',
})
export class BusquedaElectoresComponent implements OnInit {
  destroyRef:DestroyRef = inject(DestroyRef);

  displayedColumns: string[] = ['position', 'dni', 'nombres','aPaterno', 'aMaterno', 'mesa'];
  dataSource = new MatTableDataSource<PadronElectoralResponse>([]);

  formularioBusqueda!: FormGroup;
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  busquedaRealizada = false;
  tituloComponente: string = 'Búsqueda de electores';
  loading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly busquedaElectoresService: BusquedaElectoresService,
    private readonly utilityService: UtilityService
  ){}

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.formularioBusqueda = this.fb.group({
      dni: [''],
      numeroMesa: [''],
      nombres: [''],
      aPaterno: [''],
      aMaterno: ['']
    });
  }

  buscar(): void {
    if (this.loading) return;

    const criterios = this.formularioBusqueda.value;

    // Validar que al menos un campo tenga valor
    const tieneCriterios = Object.values(criterios).some(valor =>
      valor !== null && valor !== undefined && valor !== ''
    );

    if (!tieneCriterios) {
      this.utilityService.mensajePopup(this.tituloComponente, 'Debe ingresar al menos un criterio de búsqueda', IconPopType.ALERT);
      return;
    }

    this.utilityService.setLoading(true);
    this.busquedaRealizada = true;
    this.pageIndex = 0;
    this.loading = true;
    this.realizarBusqueda();
  }

  realizarBusqueda(): void {
    const criterios: PadronElectoralBusqueda = {
      dni: this.formularioBusqueda.get('dni')?.value?.trim() || null,
      numeroMesa: this.formularioBusqueda.get('numeroMesa')?.value || null,
      nombres: this.formularioBusqueda.get('nombres')?.value?.trim() || null,
      apellidoPaterno: this.formularioBusqueda.get('aPaterno')?.value?.trim() || null,
      apellidoMaterno: this.formularioBusqueda.get('aMaterno')?.value?.trim() || null
    };

    this.busquedaElectoresService.buscarElectores(criterios, this.pageIndex, this.pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.realizarBusquedaCorrecto.bind(this),
        error: (error) => {
          this.loading = false;
          this.utilityService.setLoading(false);
          this.utilityService.mensajePopup(this.tituloComponente, "Ocurrió un error al buscar electores", IconPopType.ERROR);
        }
      });
  }

  realizarBusquedaCorrecto(response: GenericResponseBean<PageResponse<PadronElectoralResponse>>){
    this.loading = false;
    this.utilityService.setLoading(false);
    if (!response.success) {
      this.utilityService.mensajePopup(this.tituloComponente, response.message, IconPopType.ALERT);
      return;
    }
    this.totalElements = response.data.totalElements;
    this.dataSource.data = response.data.content;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.realizarBusqueda();
  }

  limpiar(): void {
    this.formularioBusqueda.reset();
    this.dataSource.data = [];
    this.busquedaRealizada = false;
    this.totalElements = 0;
  }

  getNumeroFila(index: number): number {
    return (this.pageIndex * this.pageSize) + index + 1;
  }
}



