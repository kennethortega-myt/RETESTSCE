import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {Client, StompSubscription} from '@stomp/stompjs';
import { AuthComponent } from 'src/app/helper/auth-component';
import { Progress } from 'src/app/model/progress';
import { Usuario } from 'src/app/model/usuario-bean';
import { AuthService } from 'src/app/service/auth-service.service';
import { environment } from 'src/environments/environment';
import { DialogoConfirmacionComponent } from '../dialogo-confirmacion/dialogo-confirmacion.component';
import SockJS from 'sockjs-client';
import {UtilityService} from '../../../helper/utilityService';
import {IconPopType} from '../../../model/enum/iconPopType';
import { Router } from '@angular/router';
import { ImportarPadronService } from 'src/app/service/importar-padron.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PopMensajeData } from 'src/app/interface/popMensajeData.interface';
import { PopMensajeComponent } from '../../shared/pop-mensaje/pop-mensaje.component';

@Component({
  selector: 'app-instalacion-padron',
  templateUrl: './instalacion-padron.component.html',
  styleUrls: ['./instalacion-padron.component.scss']
})
export class InstalacionPadronComponent extends AuthComponent implements OnInit {

  destroyRef:DestroyRef = inject(DestroyRef);
  public usuario: Usuario;
  private client: Client;
  private subscription: StompSubscription;
  public progresoImport: number = 0;
  public baseUrl: string;
  btnSpinner=false;
  mensajes: string[] = [];
  public puedeImportar: boolean;
  mensajeAcceso: string;
  autorizado: boolean;
  public tituloAlert="Instalación de Padrones";

  constructor (
    private utilityService: UtilityService,
    public router: Router,
    public auth: AuthService,
    public importarPadronService: ImportarPadronService,
    public dialogo: MatDialog) {
    super();
    this.puedeImportar = true;
  }

  ngOnInit(){
    this.usuario = this.authentication();

    this.baseUrl = environment.apiUrlORC;
    this.progresoImport = 0;

    console.log("validar autorizacion al modulo");
    this.validaAutorizacionIngresoModulo();

    if(sessionStorage.getItem('loadingws')==null || sessionStorage.getItem('loadingws')==='true'){
      console.log("btnSpinner=true");
      this.btnSpinner=true;
    } else{
      console.log("btnSpinner=false");
      this.btnSpinner=false;
    }
  }

  conexionWebSocket(){
    console.log("probando websocket");

    this.client = new Client();
    this.client.webSocketFactory = () => {
      return new SockJS(this.baseUrl.replace(/\/$/, '') + "/ws");
    }

    this.client.connectHeaders = {
      Authorization: "Bearer " + this.auth.getCToken(),
    };

    this.client.onConnect = (frame) => {
      console.log("me estoy conectando: " + this.client.connected + ' : ' + frame);
      this.subscription = this.client.subscribe('/topic/update-progress-with-details', e => {
        let progress: Progress = JSON.parse(e.body) as Progress;
        console.log("mensaje: "+JSON.stringify(progress));
        this.progresoImport = progress.porcentaje;
        this.mensajes.push(progress.texto);
        console.log("valor progreso: "+this.progresoImport);
        if(progress.estado=='0'){
          this.utilityService.mensajePopup("Instalación de padrón","Se ha finalizado la carga con éxito",IconPopType.CONFIRM);
          sessionStorage.setItem("loadingws","true");
          this.btnSpinner=true;
          // Desuscribirse de la suscripción
          this.subscription.unsubscribe();
          this.client.deactivate();
          this.puedeImportar = false;
        } else {
          this.puedeImportar = true;
        }
      });

    }

    this.client.activate();
  }

  alertImportar(): void {
    this.dialogo
      .open(DialogoConfirmacionComponent, {
        data: `Este proceso inicializará la importación de los datos de padrones ¿Desea continuar con la carga?`
      })
      .afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.importar();
        }
      });
  }

  public importar() {
    console.log("importar");
    this.progresoImport=0;
    sessionStorage.setItem("loadingws","false");
    this.btnSpinner=false;
    this.client.publish(
      {
          destination: '/app/importar-padron-ws',
          headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    )
  }


  validaAutorizacionIngresoModulo(){
        this.importarPadronService.validarAccesoAlModulo()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(response => {
            if (response.success) {
              this.mensajeAcceso = response.data.mensaje;
              if (response.data.autorizado) {
                this.autorizado = true;
                this.conexionWebSocket();
              }else{
                console.log("No esta autorizado");
                if (response.data.solicitudGenerada) {
                  console.log("Aceptar para reedirigir al inicio");
                  let popMensaje :PopMensajeData= {
                      title:this.tituloAlert,
                      mensaje:response.data.mensaje,
                      icon:IconPopType.ALERT,
                      success:true
                  }
                  this.dialogo.open(PopMensajeComponent, {
                      data: popMensaje
                  })
                  .afterClosed()
                  .subscribe((confirmado: boolean) => {
                    if (confirmado) {
                      this.router.navigateByUrl('/principal');
                    }
                  });
                } else{
                  this.dialogo
                  .open(DialogoConfirmacionComponent, {
                    data: 'Para continuar debe solicitar acceso, ¿Desea generar una solicitud ahora?'
                  })
                  .afterClosed()
                  .subscribe((confirmado: boolean) => {
                    if (confirmado) {
                      this.solicitarAccesoNacion();
                    } else {
                      console.log("Ir al inicio");
                      this.router.navigateByUrl('/principal');
                    }
                  });
                }
              }
            }
          }, error =>{
            console.log("Se genero un error");
            if (error.error && error.error.message) {
              this.utilityService.mensajePopup(this.tituloAlert, error.error.message, IconPopType.ALERT);
            } else {
              this.utilityService.mensajePopup(this.tituloAlert,"Error interno al llamar al servicio de autorizaciones de nación.", IconPopType.ERROR);
            }
          });
    }

    solicitarAccesoNacion(){
      this.importarPadronService.solicitarAccesoAlModulo()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(response => {
          if (response.success) {
            this.validaAutorizacionIngresoModulo();
          }
        });
    }

}
