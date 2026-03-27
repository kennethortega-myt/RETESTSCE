import { ChangeDetectionStrategy, Component, Inject, signal, ChangeDetectorRef } from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatExpansionModule} from '@angular/material/expansion';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {PopEmpateVotosData} from '../../../../interface/popEmpateVotosData';
import { DistritoElectoralEmpateBean } from 'src/app/model/distritoElectoralEmpateBean';
import { VotosEmpateResultadoBean } from 'src/app/model/votosEmpateResultadoBean';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/pages/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Constantes } from 'src/app/helper/constantes';

export interface DistritoParaGrabar {
  distritoElectoral: string;
  tipoEleccion: string;
  agrupacionesPoliticasGanadoras: string[];
  numeroResolucion: string;
  agrupacionesPoliticas: VotosEmpateResultadoBean[];
}

@Component({
  selector: 'app-popup-cifra-repartidora',
  standalone: true,
  imports: [CommonModule,
    MatTableModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatTooltipModule,
    FormsModule,
    SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './popup-cifra-repartidora.component.html',
})
export class PopupCifraRepartidoraComponent {
  readonly panelOpenState = signal(false);
  displayedColumns: string[] = ['op', 'votos', 'ganador'];
  listEmpate: Array<DistritoElectoralEmpateBean>;
  proceso: string;
  tipoEleccion: string;

  panelStates: Map<string, boolean> = new Map();
  ganadoresSeleccionados: Map<string, Set<string>> = new Map();
  numerosResolucion: Map<string, string> = new Map();
  distritosGuardados: Set<string> = new Set();
  listaParaGrabar: DistritoParaGrabar[] = [];

  mensajesError: Map<string, string> = new Map();

  constructor(
    public dialogRef: MatDialogRef<PopupCifraRepartidoraComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PopEmpateVotosData,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.listEmpate = data.listEmpate;
    this.proceso = data.proceso.nombre;
    this.tipoEleccion = data.tipoEleccion.nombre;
    this.listEmpate.forEach(distrito => {
      this.panelStates.set(distrito.distritoElectoral, true);
    });
  }

  tieneDistritosParaGrabar(): boolean {
    return this.listaParaGrabar.length > 0;
  }

  isDistritoResuelto(distrito: DistritoElectoralEmpateBean): boolean {
    return distrito.agrupacionesPoliticas.some(
      agrupacion => agrupacion.estadoResolucion === Constantes.CE_ESTADO_CIFRA_GANADOR || agrupacion.estadoResolucion === Constantes.CE_ESTADO_CIFRA_PERDEDOR
    );
  }

  isDistritoEditable(distritoElectoral: string): boolean {
    const distrito = this.listEmpate.find(d => d.distritoElectoral === distritoElectoral);
    if (!distrito) return false;

    // No es editable si ya está resuelto o si ya fue guardado temporalmente
    return !this.isDistritoResuelto(distrito);
  }

  isDistritoGuardado(distritoElectoral: string): boolean {
    return this.distritosGuardados.has(distritoElectoral);
  }

  isGanadorSeleccionado(distritoElectoral: string, agrupacionPolitica: string): boolean {
    const distrito = this.listEmpate.find(d => d.distritoElectoral === distritoElectoral);

    // Si el distrito ya está resuelto desde el backend
    if (distrito && this.isDistritoResuelto(distrito)) {
      const agrupacion = distrito.agrupacionesPoliticas.find(
        a => a.agrupacionPolitica === agrupacionPolitica
      );
      return agrupacion?.estadoResolucion === Constantes.CE_ESTADO_CIFRA_GANADOR;
    }

    // Verificar en las selecciones temporales (Set)
    const ganadoresSet = this.ganadoresSeleccionados.get(distritoElectoral);
    return ganadoresSet ? ganadoresSet.has(agrupacionPolitica) : false;
  }

  seleccionarGanador(distrito: DistritoElectoralEmpateBean, agrupacion: VotosEmpateResultadoBean): void {
    if (this.isDistritoResuelto(distrito) || this.isDistritoGuardado(distrito.distritoElectoral)) {
      return;
    }

    // Obtener o crear el Set de ganadores para este distrito
    if (!this.ganadoresSeleccionados.has(distrito.distritoElectoral)) {
      this.ganadoresSeleccionados.set(distrito.distritoElectoral, new Set<string>());
    }

    const ganadoresSet = this.ganadoresSeleccionados.get(distrito.distritoElectoral);

    // Toggle: si ya está seleccionado, lo quitamos; si no, lo agregamos
    if (ganadoresSet.has(agrupacion.agrupacionPolitica)) {
      ganadoresSet.delete(agrupacion.agrupacionPolitica);
    } else {
      ganadoresSet.add(agrupacion.agrupacionPolitica);
    }

    // Limpiar mensaje de error al seleccionar
    this.limpiarMensajeError(distrito.distritoElectoral);
    this.cdr.markForCheck();
  }

  getNumeroResolucion(distritoElectoral: string): string {
    // Si ya está resuelto, obtener del backend
    const distrito = this.listEmpate.find(d => d.distritoElectoral === distritoElectoral);
    if (distrito && this.isDistritoResuelto(distrito)) {
      const ganador = distrito.agrupacionesPoliticas.find(a => a.estadoResolucion === Constantes.CE_ESTADO_CIFRA_GANADOR);
      return ganador?.numeroResolucion || '';
    }

    // Si no, obtener de la lista temporal
    return this.numerosResolucion.get(distritoElectoral) || '';
  }

  setNumeroResolucion(distritoElectoral: string, valor: string): void {
    if (this.isDistritoResuelto(this.listEmpate.find(d => d.distritoElectoral === distritoElectoral))
        || this.isDistritoGuardado(distritoElectoral)) {
      return;
    }

    this.numerosResolucion.set(distritoElectoral, valor);

    // Limpiar mensaje de error al escribir
    if (valor.trim() !== '') {
      this.limpiarMensajeError(distritoElectoral);
    }

    this.cdr.markForCheck();
  }

  mostrarBotonesAccion(distritoElectoral: string): boolean {
    const distrito = this.listEmpate.find(d => d.distritoElectoral === distritoElectoral);
    return distrito ? !this.isDistritoResuelto(distrito) : false;
  }

  getMensajeError(distritoElectoral: string): string {
    return this.mensajesError.get(distritoElectoral) || '';
  }

  setMensajeError(distritoElectoral: string, mensaje: string): void {
    this.mensajesError.set(distritoElectoral, mensaje);
    this.cdr.markForCheck();
  }

  limpiarMensajeError(distritoElectoral: string): void {
    this.mensajesError.delete(distritoElectoral);
    this.cdr.markForCheck();
  }

  tieneMensajeError(distritoElectoral: string): boolean {
    return this.mensajesError.has(distritoElectoral);
  }

  guardarDistrito(distrito: DistritoElectoralEmpateBean): void {
    const ganadoresSet = this.ganadoresSeleccionados.get(distrito.distritoElectoral);
    const numeroResolucion = this.numerosResolucion.get(distrito.distritoElectoral);

    // Limpiar mensaje de error previo
    this.limpiarMensajeError(distrito.distritoElectoral);

    // Validaciones
    if (!ganadoresSet || ganadoresSet.size === 0) {
      this.setMensajeError(distrito.distritoElectoral, 'Debe seleccionar al menos un ganador para este distrito');
      return;
    }

    if (!numeroResolucion || numeroResolucion.trim() === '') {
      this.setMensajeError(distrito.distritoElectoral, 'Debe ingresar el número de resolución');
      return;
    }

    // Marcar como guardado temporalmente
    this.distritosGuardados.add(distrito.distritoElectoral);

    // Agregar o actualizar en la lista para grabar
    const index = this.listaParaGrabar.findIndex(
      d => d.distritoElectoral === distrito.distritoElectoral
    );

    // Convertir Set a Array
    const ganadoresArray = Array.from(ganadoresSet);

    const distritoParaGrabar: DistritoParaGrabar = {
      distritoElectoral: distrito.distritoElectoral,
      tipoEleccion: distrito.tipoEleccion,
      agrupacionesPoliticasGanadoras: ganadoresArray,
      numeroResolucion: numeroResolucion.trim(),
      agrupacionesPoliticas: distrito.agrupacionesPoliticas
    };

    if (index >= 0) {
      this.listaParaGrabar[index] = distritoParaGrabar;
    } else {
      this.listaParaGrabar.push(distritoParaGrabar);
    }

    this.cdr.markForCheck();

  }

  limpiarDistrito(distrito: DistritoElectoralEmpateBean): void {
    // Quitar de guardados
    this.distritosGuardados.delete(distrito.distritoElectoral);

    // Limpiar selecciones temporales
    this.ganadoresSeleccionados.delete(distrito.distritoElectoral);
    this.numerosResolucion.delete(distrito.distritoElectoral);

    this.limpiarMensajeError(distrito.distritoElectoral);

    // Quitar de la lista para grabar
    this.listaParaGrabar = this.listaParaGrabar.filter(
      d => d.distritoElectoral !== distrito.distritoElectoral
    );

    this.cdr.markForCheck();
  }

  grabarYCerrar(): void {
    this.dialogRef.close(this.listaParaGrabar);
  }

  cerrar(){
    this.dialogRef.close();
  }
}
