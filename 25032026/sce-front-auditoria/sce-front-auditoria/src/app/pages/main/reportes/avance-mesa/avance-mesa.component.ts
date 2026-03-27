import { Component, DestroyRef, ElementRef, inject, OnInit, Renderer2, ViewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, FormGroup } from "@angular/forms";
import { combineLatest, filter, switchMap, tap } from "rxjs";
import { AuthComponent } from "src/app/helper/auth-component";
import { UtilityService } from "src/app/helper/utilityService";
import { AmbitoBean } from "src/app/model/ambitoBean";
import { CentroComputoBean } from "src/app/model/centroComputoBean";
import { IconPopType } from "src/app/model/enum/iconPopType";
import { FiltroAvanceMesaBean } from "src/app/model/filtroAvanceMesaBean";
import { GenericResponseBean } from "src/app/model/genericResponseBean";
import { EleccionResponseBean } from "src/app/model/eleccionResponseBean";
import { ProcesoElectoralResponseBean } from "src/app/model/procesoElectoralResponseBean";
import { UbigeoDTO } from "src/app/model/ubigeoElectoralBean";
import { Usuario } from "src/app/model/usuario-bean";
import { MonitoreoNacionService } from "src/app/service/monitoreo-nacion.service";
import { ReporteAvanceMesaNacionService } from "src/app/service/reporte-avance-mesa-nacion.service";
import { generarPdf } from "src/app/transversal/utils/funciones";

@Component({
    selector: 'app-avance-mesa',
    templateUrl: './avance-mesa.component.html'
})
export class AvanceMesaComponent extends AuthComponent implements OnInit {
    @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;
    public form: FormGroup;
    public listProceso: Array<ProcesoElectoralResponseBean>;
    public listEleccion: Array<EleccionResponseBean>;
    public listCentrosComputo: Array<CentroComputoBean>;
    public listOdpes: Array<AmbitoBean>;
    public listNivelUbigeoUno: Array<UbigeoDTO>;
    public listNivelUbigeoDos: Array<UbigeoDTO>;
    public listNivelUbigeoTres: Array<UbigeoDTO>;
    public usuario: Usuario;

    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    public isShowReporte: boolean;
    public tituloAlert = "Reporte Avance de mesa por mesa";
    public mensaje: string = 'Por favor, seleccione el ámbito para realizar la búsqueda.';
    constructor(private readonly formBuilder: FormBuilder,
        private readonly monitoreoService: MonitoreoNacionService,
        private readonly utilityService: UtilityService,
        private readonly renderer: Renderer2,
        private readonly reporteAvanceMesaService: ReporteAvanceMesaNacionService,
    ) {
        super();
        this.form = this.formBuilder.group({
            proceso: [{ value: '0', disabled: false }],
            eleccion: [{ value: '0', disabled: false }],
            tipoReporte: [{ value: 0, disabled: false }],
            ambitoElectoral: [{ value: '0', disabled: false }],
            centroComputo: [{ value: '0', disabled: false }],
            nivelUbigeoUno: [{ value: '0', disabled: false }],
            nivelUbigeoDos: [{ value: '0', disabled: false }],
            nivelUbigeoTres: [{ value: '0', disabled: false }],
        })
    }

    ngOnInit(): void {
        this.usuario = this.authentication();
        this.inicializarPeticiones();
        this.eventChanged();
    }

    eventChanged(): void {
        this.valueChangedProceso();
        this.valueChangedEleccion();
        this.valueChangedNivelUbigeoUno();
        this.valueChangedNivelUbigeoDos();
        this.valueChangedCentroComputo();
    }

    inicializarPeticiones() {
        this.monitoreoService.obtenerProcesosElectorales()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: this.obtenerProcesosCorrecto.bind(this)
            });
    }

    obtenerProcesosCorrecto(response: GenericResponseBean<Array<ProcesoElectoralResponseBean>>) {
        if (response.success) {
            this.listProceso = response.data;
        }
    }

    valueChangedProceso(): void {
        this.form.get('proceso').valueChanges
            .pipe(
                tap(() => {
                    this.form.get('eleccion').setValue('0', { emitEvent: false });
                    this.form.get('centroComputo').setValue('0', { emitEvent: false });
                    this.form.get('nivelUbigeoUno').setValue('0', { emitEvent: false });
                    this.form.get('nivelUbigeoDos').setValue('0', { emitEvent: false });
                    this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
                    this.form.get('ambitoElectoral').setValue('0', { emitEvent: false });
                }),
                filter(value => {
                    this.listEleccion = [];
                    this.listCentrosComputo = [];
                    this.listNivelUbigeoUno = [];
                    this.listNivelUbigeoDos = [];
                    this.listNivelUbigeoTres = [];
                    this.listOdpes = [];
                    if (value == 0) {
                        return false;
                    } else {
                        return true;
                    }
                }),
                switchMap(proceso => {
                    return combineLatest([
                        this.monitoreoService.obtenerEleccionesNacion(proceso.id, proceso.acronimo)
                    ])
                }
                ),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: ([elecciones]) => {
                    this.obtenerEleccionesCorrecto(elecciones);
                },
            })
    }

    valueChangedEleccion(): void {
        this.form.get('eleccion').valueChanges
            .pipe(
                tap(() => {
                    this.form.get('centroComputo').setValue('0', { emitEvent: false });
                    this.form.get('nivelUbigeoUno').setValue('0', { emitEvent: false });
                    this.form.get('nivelUbigeoDos').setValue('0', { emitEvent: false });
                    this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
                }),
                filter(value => {
                    this.listNivelUbigeoUno = [];
                    this.listNivelUbigeoDos = [];
                    this.listNivelUbigeoTres = [];
                    this.listCentrosComputo = [];
                    if (value == 0) {
                        return false;
                    } else {
                        return true;
                    }
                }),
                switchMap(eleccion => this.monitoreoService.obtenerCentroComputoPorIdEleccion(
                    eleccion.id,
                    this.form.get('proceso').value.nombreEsquemaPrincipal,
                    this.form.get('proceso').value.acronimo)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: this.obtenerCentrosComputoCorrecto.bind(this)
            })
    }
    valueChangedCentroComputo(): void {
        this.form.get('centroComputo').valueChanges
            .pipe(
                tap(() => {
                    this.form.get('ambitoElectoral').setValue('00', { emitEvent: false });
                    this.form.get('nivelUbigeoUno').setValue('0', { emitEvent: false });
                    this.form.get('nivelUbigeoDos').setValue('0', { emitEvent: false });
                    this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
                }),
                filter(value => {
                    this.listOdpes = [];
                    this.listNivelUbigeoUno = [];
                    this.listNivelUbigeoDos = [];
                    this.listNivelUbigeoTres = [];
                    if (value == 0) {
                        return false;
                    } else {
                        return true;
                    }
                }),
                switchMap(centroComputo => {
                    let idEleccion = this.form.get('eleccion').value.id;
                    return combineLatest([
                        this.monitoreoService.obtenerAmbitoElectoralPorIdCentroComputo(
                            centroComputo.id,
                            this.form.get('proceso').value.nombreEsquemaPrincipal,
                            this.form.get('proceso').value.acronimo),
                        this.monitoreoService.obtenerUbigeoNivelUnoPorEleccionYCentroComputo(idEleccion, centroComputo.id,
                          this.form.get('proceso').value.nombreEsquemaPrincipal,
                          this.form.get('proceso').value.acronimo)
                    ])
                }
                ),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                //error: this.getProvinciaIncorrecto.bind(this)
                next: ([ambitoElectoral, nivelUbigeoUno]) => {
                    this.obtenerAmbitoElectoralCorrecto(ambitoElectoral);
                    this.obtenerUbigeoNivelUnoCorrecto(nivelUbigeoUno);

                }
            });
    }

    valueChangedNivelUbigeoUno(): void {
        this.form.get('nivelUbigeoUno').valueChanges
            .pipe(
                tap(() => {
                    this.form.get('nivelUbigeoDos').setValue('0', { emitEvent: false });
                }),
                filter(value => {
                    this.listNivelUbigeoDos = [];
                    if (value == 0) {
                        return false;
                    } else {
                        return true;
                    }
                }),
                switchMap(nivelUbigeoUno =>
                    this.monitoreoService.obtenerProvinciasNacion(nivelUbigeoUno,
                        this.form.get('eleccion').value.id,
                        this.form.get('proceso').value.acronimo,
                        this.form.get('proceso').value.nombreEsquemaPrincipal,
                        this.form.get('centroComputo').value.id
                    )
                ),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: this.obtenerUbigeoNivelDosCorrecto.bind(this),
                //error: this.getProvinciaIncorrecto.bind(this)
            });
    }

    valueChangedNivelUbigeoDos() {
        this.form.get('nivelUbigeoDos')!.valueChanges
            .pipe(
                tap(() => {
                    this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
                }),
                filter(value => {
                    this.listNivelUbigeoTres = [];
                    if (value == 0) {
                        return false;
                    } else {
                        return true;
                    }
                }),
                switchMap(nivelUbigeoDos =>
                    this.monitoreoService.obtenerDistritosNacion(
                        nivelUbigeoDos,
                        this.form.get('eleccion').value.id,
                        this.form.get('proceso').value.acronimo,
                        this.form.get('proceso').value.nombreEsquemaPrincipal,
                        this.form.get('centroComputo').value.id)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: this.obtenerUbigeoNivelTresCorrecto.bind(this)
            });
    }

    obtenerAmbitoElectoralCorrecto(response) {
        this.listOdpes = response.data;

    }

    obtenerEleccionesCorrecto(response: GenericResponseBean<Array<EleccionResponseBean>>) {
        this.listEleccion = response.data;
    }

    obtenerCentrosComputoCorrecto(response: GenericResponseBean<Array<CentroComputoBean>>) {
        if (response.success) {
            this.listCentrosComputo = response.data;
        }
    }


    obtenerUbigeoNivelUnoCorrecto(response: GenericResponseBean<Array<UbigeoDTO>>) {
        if (response.success) {
            this.listNivelUbigeoUno = response.data;
        }
    }

    obtenerUbigeoNivelDosCorrecto(response: GenericResponseBean<Array<UbigeoDTO>>) {
        if (response) {
            this.listNivelUbigeoDos = response as any;
        }
    }

    obtenerUbigeoNivelTresCorrecto(response: GenericResponseBean<Array<UbigeoDTO>>) {
        if (response) {
            this.listNivelUbigeoTres = response as any;
        }
    }

    buscarReporte(): void {
        if (!this.sonValidosLosDatosMinimos()) return;

        this.mensaje = '';
        let filtros: FiltroAvanceMesaBean = this.mapearCampos();
        this.isShowReporte = true;
        this.reporteAvanceMesaService.getReporteAvanceMesaPdf(filtros)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: this.getReporteAvanceMesaPdfCorrecto.bind(this),
                error: this.getReporteAvanceMesaPdfIncorrecto.bind(this)
            });
    }

    getReporteAvanceMesaPdfCorrecto(response: GenericResponseBean<string>) {
        if (response.success) {
            this.generarReporte(response)
        } else {
            this.isShowReporte = false;
        }
    }
    generarReporte(response: GenericResponseBean<string>) {

        this.renderer.setProperty(this.midivReporte.nativeElement, 'innerHTML', '');

        sessionStorage.setItem('loading', 'false');

        if (response.success) {
            generarPdf(response.data, this.midivReporte);

        } else {
            this.isShowReporte = false;
            this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
        }
    }
    getReporteAvanceMesaPdfIncorrecto(error: any) {
        this.isShowReporte = false;
        this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de avance de mesas.", IconPopType.ERROR);
    }
    mapearCampos(): FiltroAvanceMesaBean {
        let filtros: FiltroAvanceMesaBean = new FiltroAvanceMesaBean();
        filtros.schema = this.form.get('proceso').value.nombreEsquemaPrincipal
        filtros.proceso = this.form.get('proceso').value.id;
        filtros.eleccion = this.form.get('eleccion').value == "0" ? null : this.form.get('eleccion').value.id;
        filtros.schema = this.form.get('ambitoElectoral').value == 0 ? null : this.form.get('ambitoElectoral').value.codigo;
        filtros.idCentroComputo = this.form.get('centroComputo').value == 0 ? null : this.form.get('centroComputo').value.codigo;
        filtros.departamento = this.form.get('nivelUbigeoUno').value == "0" ? null : this.form.get('nivelUbigeoUno').value;
        filtros.provincia = this.form.get('nivelUbigeoDos').value == "0" ? null : this.form.get('nivelUbigeoDos').value;
        filtros.distrito = this.form.get('nivelUbigeoTres').value == "0" ? null : this.form.get('nivelUbigeoTres').value;
        return filtros;
    }
    sonValidosLosDatosMinimos(): boolean {
        if (!this.form.get('proceso').value ||
            this.form.get('proceso').value === '0') {
            this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso", IconPopType.ALERT);
            return false;
        }
        if (!this.form.get('eleccion').value ||
            this.form.get('eleccion').value === '0') {
            this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una elección", IconPopType.ALERT);
            return false;
        }


        if (this.form.get('centroComputo').value === '00') {
            this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un centro de cómputo", IconPopType.ALERT);
            return false;
        }

        if ('00' === this.form.get('ambitoElectoral').value.toString()) {
            this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un odpe", IconPopType.ALERT);
            return false;
        }

        return true;
    }
}
