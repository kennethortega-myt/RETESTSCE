import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthComponent } from 'src/app/helper/auth-component';
import { AuthService } from 'src/app/service/auth-service.service';
import { DialogoConfirmacionComponent } from '../dialogo-confirmacion/dialogo-confirmacion.component';
import {Client, StompSubscription} from '@stomp/stompjs';
import { Usuario } from 'src/app/model/usuario-bean';
import { environment } from 'src/environments/environment';
import SockJS from 'sockjs-client';
import { Progress } from 'src/app/model/progress';
import {PopMensajeData} from "../../../interface/popMensajeData.interface";
import {PopMensajeComponent} from "../../shared/pop-mensaje/pop-mensaje.component";
import { ImportarNacionService } from 'src/app/service/importar-nacion.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UtilityService } from 'src/app/helper/utilityService';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carga-inicial',
  templateUrl: './carga-inicial.component.html',
})
export class CargaInicialComponent extends AuthComponent implements OnInit, OnDestroy{

  destroyRef:DestroyRef = inject(DestroyRef);
  public usuario: Usuario;
  private readonly client: Client;
  private subscription: StompSubscription;
  public progresoImport: number = 0;
  mensajes: string[] = [];
  public baseUrl: string;
  public isConsulta: boolean;
  public puedeImportar: boolean;
  mensajeAcceso: string;
  autorizado: boolean;
  public tituloAlert="Carga inicial";

  constructor(private readonly http: HttpClient,
    public router: Router,
    public auth: AuthService,
    public importarNacionService: ImportarNacionService,
    private readonly utilityService: UtilityService,
    public dialogo: MatDialog){
      super();
      this.isConsulta=true;
      this.client = new Client();
      this.puedeImportar = true;
    }

  ngOnInit() {
    this.usuario = this.authentication();
    this.validaAutorizacionIngresoModulo();
  }



  conexionWebSocket(){
    this.baseUrl = environment.apiUrlORC;
    this.progresoImport = 0;

    this.client.webSocketFactory = () => {
      return new SockJS(this.baseUrl.replace(/\/$/, '') + "/ws");
    }

    this.client.connectHeaders = {
      Authorization: "Bearer " + this.auth.getCToken(),
    };

    this.client.onConnect = (frame) => {
      console.log("conectandose...");
      this.subscription = this.client.subscribe('/topic/update-progress-with-details', e => {
        sessionStorage.setItem('loading','false');
        let progress: Progress = JSON.parse(e.body) as Progress;
        console.log("mensaje: "+JSON.stringify(progress));
        this.progresoImport = progress.porcentaje;
        this.mensajes.push(progress.texto);
        console.log("valor progreso: "+this.progresoImport);
        if(progress.estado=='0'){
          this.mensajePopup("Carga inicial", "Se ha finalizado la carga con éxito.", IconPopType.CONFIRM);
          // Desuscribirse de la suscripción
          this.subscription.unsubscribe();
          this.client.deactivate();
          this.puedeImportar = false;
        } else {
          this.puedeImportar = true;
        }
      }
    );

      this.publicarData();
    }

    this.client.activate();
  }


  mensajePopup(title:string , mensaje:string, icon:string){
    let popMensaje :PopMensajeData= {
      title:title,
      mensaje:mensaje,
      icon:icon,
      success:true
    }
    this.dialogo.open(PopMensajeComponent, {
      data: popMensaje
    })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          //aceptar
        }
      });
  }

  alertImportar(): void {
    this.dialogo
      .open(DialogoConfirmacionComponent, {
        data: `Este proceso inicializará la base de datos y eliminará los datos previamente cargados ¿Desea continuar con la carga?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.conexionWebSocket();
        }
      });
  }

  public publicarData() {
    sessionStorage.setItem('loading','true');
    this.isConsulta=false;
    this.mensajes=[];
    console.log("importar");
    this.client.publish(
      {
      destination: '/app/importar-ws',
      headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    )
  }

  validaAutorizacionIngresoModulo(){
      this.importarNacionService.validarAccesoAlModulo()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(response => {
          if (response.success) {
            this.mensajeAcceso = response.data.mensaje;
            if (response.data.autorizado) {
              this.autorizado = true;
              // se muestra el módulo
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
          if (error.error?.message) {
            this.utilityService.mensajePopup(this.tituloAlert, error.error.message, IconPopType.ALERT);
          } else {
            this.utilityService.mensajePopup(this.tituloAlert,"Error interno al llamar al servicio de autorizaciones de nación.", IconPopType.ERROR);
          }
        });
  }

  solicitarAccesoNacion(){
    this.importarNacionService.solicitarAccesoAlModulo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(response => {
        if (response.success) {
          this.validaAutorizacionIngresoModulo();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.client.connected){
      this.subscription.unsubscribe();
      this.client.deactivate();
    }

  }

}
