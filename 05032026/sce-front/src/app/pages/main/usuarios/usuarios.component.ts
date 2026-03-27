import {
  AfterViewInit,
  Component,
  DestroyRef, ElementRef,
  inject,
  OnInit, Renderer2,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { EMPTY, scan, Subject, switchMap } from 'rxjs';
import { UtilityService } from 'src/app/helper/utilityService';
import { IUsuario } from 'src/app/interface/usuario.interface';
import { CentroComputoBean } from 'src/app/model/centroComputoBean';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { UsuarioService } from 'src/app/service/usuario.service';
import {
  ModalEditarUsuarioComponent,
  ModalEditarUsuarioComponentData,
} from './modal-editar-usuario/modal-editar-usuario.component';
import { OrcDetalleCatalogoEstructuraBean } from 'src/app/model/orcDetalleCatalogoEstructuraBean';
import { HttpErrorResponse } from '@angular/common/http';
import {GenericResponseBean} from '../../../model/genericResponseBean';
import {generarPdf} from '../../../transversal/utils/funciones';
import {AuthComponent} from '../../../helper/auth-component';

import { PopReportePuestaCeroComponent } from '../puesta-cero/pop-reporte-puesta-cero/pop-reporte-puesta-cero.component';


@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
})
export class UsuariosComponent extends AuthComponent implements OnInit, AfterViewInit {

  private readonly lettersAndSpacesRegex = /[^\p{L} ]/gu;
  private readonly usernameRegex = /[^\p{L}\p{N}_ ]/gu;
  private readonly numericRegex = /\D+/g;

  private readonly filterLoaded: Subject<boolean> = new Subject<boolean>();

  public loadingModal: boolean = false;

  // Defaults para limpiar los filtros
  public defaultAcronimoProceso: string = '';
  public defaultCodigoEleccion: string = '';
  public defaultCentroComputo: string = '';

  public listPerfiles: OrcDetalleCatalogoEstructuraBean[] = [];
  public tiposDocumento: OrcDetalleCatalogoEstructuraBean[];
  public listProceso: ProcesoElectoralResponseBean[] = [];
  public listElecciones: EleccionResponseBean[] = [];
  public listCentroComputo: CentroComputoBean[] = [];

  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly monitoreoService: MonitoreoNacionService = inject(
    MonitoreoNacionService
  );
  private readonly usuarioService: UsuarioService = inject(UsuarioService);
  private readonly utilityService: UtilityService = inject(UtilityService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  readonly titulo = 'Usuarios';

  readonly searchForm = this.fb.group({
    proceso: ['0', []],
    eleccion: ['0', []],
    centroComputo: ['0', []],
    usuario: ['', Validators.maxLength(50)],
    documento: ['', Validators.maxLength(20)],
    apellidoPaterno: ['', Validators.maxLength(100)],
    apellidoMaterno: ['', Validators.maxLength(100)],
    nombres: ['', Validators.maxLength(100)],
    perfil: ['0', []],
    personaAsignada: [-1, []],
    desincronizado: [-1, []],
  });

  private searchFilter = {
    proceso: '',
    centroComputo: '',
    usuario: '',
    documento: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    nombres: '',
    perfil: '',
    personaAsignada: -1,
    desincronizado: -1,
  };

  readonly displayedColumns: string[] = [
    '#',
    'proceso',
    'centroComputo',
    'usuario',
    'documento',
    'apellidoPaterno',
    'apellidoMaterno',
    'nombres',
    'perfil',
    'acciones',
  ];
  readonly dataSource = new MatTableDataSource<IUsuario>([]);
  @ViewChild(MatPaginator, { static: true })
  readonly paginator: MatPaginator = Object.create(null);
  totalRegistro: number = 0;
  page: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;
  public isShowReporte: boolean;
  constructor(private readonly renderer: Renderer2) {
    super();
  }

  ngOnInit(): void {
    this.isShowReporte = false;
    this.cargarPerfiles();
    this.cargarTiposDocumento();
    this.cargarProcesos();
    this.valueChangedProceso();
    this.valueChangedEleccion();
    this.cargarUsuarios();
    this.initFormSanitize();
  }

  ngAfterViewInit(): void {
    this.initPagination();
  }

  initPagination(): void {
    this.paginator.page
      .pipe(
        switchMap(() => {
          return this.cargarUsuarios();
        })
      )
      .subscribe({
        next: (res) => {
          this.dataSource.data = res.data.list;
          this.totalRegistro = res.data.total;
          this.pageIndex = this.paginator.pageIndex;
        },
      });
    this.filterLoaded.subscribe((_loaded) => {
      this.onSearch();
    });
  }

  initFormSanitize(): void {
    // Documento
    this.searchForm.controls.documento.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        const sanitized: string = value?.replace(this.numericRegex, '') ?? '';
        this.searchForm.controls.documento.setValue(sanitized.toUpperCase(), {
          emitEvent: false,
        });
      });
    // Usuario
    this.searchForm.controls.usuario.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        const sanitized: string = value?.replace(this.usernameRegex, '') ?? '';
        this.searchForm.controls.usuario.setValue(sanitized.toUpperCase(), {
          emitEvent: false,
        });
      });
    const alphaNumericFields = [
      'apellidoPaterno',
      'apellidoMaterno',
      'nombres',
    ];
    for (const field of alphaNumericFields) {
      this.searchForm
        .get(field)
        .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((value) => {
          const sanitized: string =
            value?.replace(this.lettersAndSpacesRegex, '') ?? '';
          this.searchForm
            .get(field)
            .setValue(sanitized.toUpperCase(), { emitEvent: false });
        });
    }
  }

  cargarPerfiles(): void {
    this.usuarioService
      .listPerfiles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.listPerfiles = res.data;
        },
      });
  }

  cargarTiposDocumento(): void {
    this.usuarioService
      .listTiposDocumento()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.tiposDocumento = res.data;
        },
      });
  }

  cargarProcesos(): void {
    this.monitoreoService
      .obtenerProcesos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.listProceso = response.data;
            if (this.listProceso.length === 0) {
              this.filterLoaded.next(true);
              this.filterLoaded.complete();
            } else {
              this.defaultAcronimoProceso = this.listProceso[0].acronimo;
              this.searchForm.controls.proceso.setValue(
                this.listProceso[0].acronimo,
              );
            }
          } else {
            this.utilityService.mensajePopup(
              this.titulo,
              'Hubo un problema al cargar la lista de actas.',
              IconPopType.ALERT
            );
          }
        },
      });
  }

  onSearch() {
    let proceso = this.searchForm.controls.proceso?.value?.toString() ?? '';
    if (proceso === '0') proceso = '';
    let centroComputo = this.searchForm.controls.centroComputo?.value?.toString() ?? '';
    if (centroComputo === '0') centroComputo = '';
    let perfil = this.searchForm.controls.perfil.value ?? '';
    if (perfil === '0') perfil = '';
    this.searchFilter = {
      proceso,
      centroComputo,
      usuario: this.searchForm.controls.usuario.value ?? '',
      documento: this.searchForm.controls.documento.value,
      apellidoPaterno: this.searchForm.controls.apellidoPaterno.value ?? '',
      apellidoMaterno: this.searchForm.controls.apellidoMaterno.value ?? '',
      nombres: this.searchForm.controls.nombres.value ?? '',
      perfil,
      personaAsignada: this.searchForm.controls.personaAsignada.value ?? -1,
      desincronizado:
        this.searchForm.controls.desincronizado.value ?? -1,
    };
    this.paginator.pageIndex = 0;
    this.paginator.page.emit();

  }

  clearForm() {
    this.searchFilter = {
      proceso: this.defaultAcronimoProceso,
      centroComputo: this.defaultCentroComputo,
      usuario: '',
      documento: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      nombres: '',
      perfil: '',
      personaAsignada: -1,
      desincronizado: -1,
    };
    this.searchForm.controls['proceso'].setValue(this.defaultAcronimoProceso);
    this.searchForm.controls['perfil'].setValue('0');
    this.searchForm.controls['personaAsignada'].setValue(-1);
    this.searchForm.controls['desincronizado'].setValue(-1);
    for (const control in this.searchForm.controls) {
      if (
        [
          'proceso',
          'eleccion',
          'centroComputo',
          'perfil',
          'personaAsignada',
          'desincronizado',
        ].includes(control)
      )
        continue;
      this.searchForm.controls[control].reset();
    }
    this.paginator.pageIndex = 0;
    this.paginator.page.emit();
  }

  cargarUsuarios() {
    const filtros = {
        proceso: this.searchFilter.proceso,
        centroComputo: this.searchFilter.centroComputo,
        apellidoPaterno: this.searchFilter.apellidoPaterno,
        apellidoMaterno: this.searchFilter.apellidoMaterno,
        nombres: this.searchFilter.nombres,
        perfil: this.searchFilter.perfil,
        usuario: this.searchFilter.usuario,
        documento: this.searchFilter.documento,
        personaAsignada: this.searchFilter.personaAsignada,
        desincronizado: this.searchFilter.desincronizado
    };
    return this.usuarioService
      .listUsuarios(
        this.paginator.pageIndex,
        this.paginator.pageSize,
        filtros
      )
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  valueChangedProceso(): void {
    this.searchForm.controls.proceso.valueChanges
      .pipe(
        switchMap((acronimoProceso) => {
          let proceso = this.listProceso.find(
            (p) => p.acronimo === acronimoProceso
          );
          // Limpiando valores
          if (proceso === undefined || acronimoProceso === '0') {
            this.listElecciones = [];
            this.searchForm.controls.eleccion.setValue('0');
            this.searchForm.controls.centroComputo.setValue('0');
            return EMPTY;
          }
          return this.monitoreoService.obtenerEleccionesNacion(
            proceso.id.toString(),
            proceso.acronimo
          );
        }),
        scan((acc, res) => {
          return { isFirst: acc === null, res };
        }, null),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ isFirst, res }) => {
          this.listElecciones = res.data;
          if (this.listElecciones.length > 0) {
            if (isFirst) {
              this.defaultCodigoEleccion = this.listElecciones[0].codigo;
            }
            this.searchForm.controls.eleccion.setValue(
              this.listElecciones[0].codigo
            );
          }
          if (isFirst) {
            this.filterLoaded.next(true);
            this.filterLoaded.complete();
          }
        },
      });
  }

  valueChangedEleccion(): void {
    this.searchForm.controls.eleccion.valueChanges
      .pipe(
        switchMap((codigoEleccion) => {
          let acronimoProceso = this.searchForm.controls.proceso.value;
          let proceso = this.listProceso.find(
            (p) => p.acronimo === acronimoProceso
          );
          let eleccion = this.listElecciones.find(
            (e) => e.codigo === codigoEleccion
          );
          // Limpiando valores
          if (
            proceso === undefined ||
            eleccion === undefined ||
            codigoEleccion === '0'
          ) {
            this.listCentroComputo = [];
            this.searchForm.controls.centroComputo.setValue('0');
            return EMPTY;
          }

          return this.monitoreoService.obtenerCentroComputoPorIdEleccion(
            Number(eleccion.id),
            proceso.nombreEsquemaPrincipal,
            proceso.acronimo
          );
        }),
        scan((acc, res) => {
          return { isFirst: acc === null, res };
        }, null),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ isFirst, res }) => {
          this.listCentroComputo = res.data;
          if (this.listCentroComputo.length > 0) {
            if (isFirst) {
              this.defaultCentroComputo = this.listCentroComputo[0].codigo;
            }
            this.searchForm.controls.centroComputo.setValue(
              this.listCentroComputo[0].codigo
            );
          }
        },
      });
  }

  modalEditarUsuario(usuario: IUsuario) {
    if (this.loadingModal === true) return;

    this.loadingModal = true;
    this.usuarioService
      .getUsuario(usuario.usuario)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const dialogRef = this.dialog.open<
            ModalEditarUsuarioComponent,
            ModalEditarUsuarioComponentData
          >(ModalEditarUsuarioComponent, {
            data: {
              usuario: res.data.usuario,
              usuarioSasa: res.data.usuarioSasa,
              sasaMessage: res.message,
              perfiles: this.listPerfiles,
              tiposDocumento: this.tiposDocumento,
            },
            disableClose: true,
          });
          dialogRef.afterClosed().subscribe((res) => {
            if (res === undefined || res === '' || res === null) {
              return;
            }
            this.paginator.page.emit();
          });
        },
        error: (res) => {
          this.loadingModal = false;
        },
        complete: () => {
          this.loadingModal = false;
        },
      });
  }

  sincronizarUsuario(usuario: IUsuario) {
    this.utilityService.popupConfirmacionConAccion(
      undefined,
      '¿Está seguro de que desea realizar esta acción?',
      () => {
        this.loadingModal = true;
        this.usuarioService.sincronizarUsuario(usuario.usuario).subscribe({
          next: (res) => {
            if (res.success) {
              this.utilityService.mensajePopup(
                res.message,
                undefined,
                IconPopType.CONFIRM
              );
              this.onSearch();
            }
          },
          error: (err) => {
            if (err instanceof HttpErrorResponse) {
              if (err.status === 0) {
                this.utilityService.mensajePopup(
                  'Error de red',
                  'Verifica tu conexión o si el backend está disponible',
                  IconPopType.ERROR
                );
                return;
              }
              const errorMessage = err.error.message;
              const details = [];
              let detailMessage: string | undefined = undefined;
              if (errorMessage === 'Error de validación') {
                for (const field in err.error.data) {
                  details.push(err.error.data[field]);
                }
              }
              if (details.length > 0) {
                detailMessage = details.join(', ');
              }
              this.utilityService.mensajePopup(
                errorMessage,
                detailMessage,
                IconPopType.ERROR
              );
            }
            this.loadingModal = false;
          },
          complete: () => (this.loadingModal = false),
        });
      }
    );
  }

  getRowIndex(index: number): number {
    return index + 1 + this.pageIndex * this.paginator.pageSize;
  }

  imprimir() {
    this.isShowReporte = true;
    sessionStorage.setItem('loading','true');

    const filtros = {
      proceso: this.searchFilter.proceso,
      centroComputo: this.searchForm.controls.centroComputo.value,
      apellidoPaterno: this.searchFilter.apellidoPaterno,
      apellidoMaterno: this.searchFilter.apellidoMaterno,
      nombres: this.searchFilter.nombres,
      perfil: this.searchFilter.perfil,
      usuario: this.searchFilter.usuario,
      documento: this.searchFilter.documento,
      personaAsignada: this.searchFilter.personaAsignada,
      desincronizado: this.searchFilter.desincronizado
    };

    this.usuarioService
      .getReporteUsuarios(
        this.paginator.pageIndex,
        this.paginator.pageSize,
        filtros,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.descargarPdf(response);
        },
        error: () => {
          sessionStorage.setItem('loading', 'false');
          this.isShowReporte = false;
          this.utilityService.mensajePopup(
            this.titulo,
            'No fue posible obtener el reporte de lista de usuarios.',
            IconPopType.ERROR,
          );
        },
      });
  }


  descargarPdf(response: GenericResponseBean<string>){
    sessionStorage.setItem('loading','false');
      if (response.success){
        this.dialog.open(PopReportePuestaCeroComponent, {
          width: '1200px',
          maxWidth: '80vw',
          data: {
            dataBase64: response.data,
            nombreArchivoDescarga: 'Mantenimiento-Usuarios.pdf',
            success: true
          }
        });

      }else{
        this.isShowReporte = false;
        this.utilityService.mensajePopup(this.titulo, response.message, IconPopType.ERROR);
      }

    }

}
