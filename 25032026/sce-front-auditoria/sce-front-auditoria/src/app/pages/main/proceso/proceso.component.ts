import {Component, OnInit, OnDestroy} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {PopProcesoComponent} from './pop-proceso/pop-proceso.component';
import {ConfiguracionProcesoElectoralService} from "../../../service-api/configuracion-proceso-electoral.service";
import {ConfiguracionProcesoElectoralInterface} from "../../../interface/configuracionProcesoElectoral.interface";
import {PopNuevoPComponent} from "./pop-nuevo-p/pop-nuevo-p.component";
import {GeneralService} from "../../../service/general-service.service";
import {Subscription} from "rxjs";
import {IconPopType, TitlePop} from '../../../model/enum/iconPopType';


@Component({
  selector: 'app-proceso',
  templateUrl: './proceso.component.html',
})
export class ProcesoComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  listaProcesoElectoral: Array<ConfiguracionProcesoElectoralInterface> = [];
  logo = '';
  idProceso: number = 0;

  constructor(
    public dialog: MatDialog,
    private configuracionProcesoService: ConfiguracionProcesoElectoralService,
    private generalService: GeneralService,
  ) {

  }

  ngOnInit(): void {
    this.listProceso();
  }

  update(isDetalle: boolean, data: ConfiguracionProcesoElectoralInterface) {
    const dialogRef = this.dialog.open(PopProcesoComponent, {
      width: '100%',
      maxWidth: '680px',
      disableClose: true,
      data: {isDetalle: isDetalle, ...data}
    });
    this.subscription = dialogRef.componentInstance.getDataObservable().subscribe(result => {
      if (result) {
        this.configuracionProcesoService.update(result.data, result.file).subscribe(async (response) => {
          if (response.success) {
            await this.generalService.openDialogoGeneral({
              mensaje: "Proceso actualizado correctamente",
              icon: IconPopType.CONFIRM,
              title: TitlePop.INFORMATION,
              success: true
            });

            this.listProceso();
          }
        }, async (error) => {
          const errorMessage = error?.error?.message ?? "";
          const displayMessage = errorMessage.split(":")[1] ?? errorMessage;
          await this.generalService.openDialogoGeneral({
            mensaje: displayMessage,
            icon: IconPopType.ALERT,
            title: TitlePop.INFORMATION,
            success: true
          });

        })
      }
    });
  }

  listProceso() {
    sessionStorage.setItem("loading", "true");
    this.configuracionProcesoService.listProcesoElectoral().subscribe(response => {
      this.listaProcesoElectoral = response.data;
      sessionStorage.setItem("loading", "false");
    }, error => {
      sessionStorage.setItem("loading", "false");
    })
  }

  async eliminarProceso(id: any) {

    this.generalService.openDialogoGeneral({
      mensaje: "¿Está seguro de eliminar el proceso?",
      icon: "questions",
      title: TitlePop.INFORMATION,
      success: true,
      isQuestion: true
    }).then(resp => {
      resp.afterClosed().subscribe(result => {
        if (result) {
          this.configuracionProcesoService.eliminarProceso({estado: 0, id: id}).subscribe(response => {
            if (response.success) {
              this.listProceso();
            }else{
              this.generalService.openDialogoGeneral({
                mensaje: response.message,
                icon: IconPopType.ALERT,
                title: TitlePop.INFORMATION,
                success: true
              });
            }
          }, error => {
            const errorMessage = error?.error?.message ?? "";
            const displayMessage = errorMessage.split(":")[1] ?? errorMessage;
             this.generalService.openDialogoGeneral({
              mensaje: displayMessage,
              icon: IconPopType.ALERT,
              title: TitlePop.INFORMATION,
              success: true
            });
          })
        }
      })
    });


  }

  crearProceso() {
    const dialogRef = this.dialog.open(PopNuevoPComponent, {
      width: '100%',
      maxWidth: '480px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(resul => {
      if (resul) {
        this.listProceso();
      }
    })
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
