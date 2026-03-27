import {Component} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {ConfiguracionProcesoElectoralService} from "../../../../service-api/configuracion-proceso-electoral.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {GeneralService} from "../../../../service/general-service.service";
import {IconPopType, TitlePop} from '../../../../model/enum/iconPopType';

@Component({
  selector: 'app-pop-nuevo-p',
  templateUrl: './pop-nuevo-p.component.html',
  styleUrls: ['./pop-nuevo-p.component.scss']
})
export class PopNuevoPComponent {
  formGroupParent: FormGroup;
  imagenSeleccionado: File = new File([], '');
  logo = '';
  idProceso: number = 0;

  constructor(
    private configuracionProcesoService: ConfiguracionProcesoElectoralService,
    public formBuilder: FormBuilder,
    private generalService: GeneralService,
    public matRef: MatDialogRef<PopNuevoPComponent>
  ) {
    this.formGroupParent = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      acronimo: ['', [Validators.required]],
      nombreEsquemaPrincipal: ['', [Validators.required]],
      nombreEsquemaBdOnpe: ['', [Validators.required]],
      nombreDbLink: ['', [Validators.required]],
      fechaConvocatoria: [{value:'', disabled: true}, [Validators.required]],
      activo: 1
    });
  }

  cargarDatos() {
    sessionStorage.setItem("loading", "true");
    this.configuracionProcesoService.cargaDatos(this.idProceso, this.formGroupParent.get("nombreEsquemaPrincipal").value,
      this.formGroupParent.get("nombreEsquemaBdOnpe").value, this.formGroupParent.get("nombreDbLink").value,
      this.formGroupParent.get("acronimo").value).subscribe(async (response) => {
      if (response.success) {
        console.log(response);
        sessionStorage.setItem("loading", "false");
        await this.generalService.openDialogoGeneral({
          mensaje: "Se cargó la data correctamente.",
          icon: IconPopType.CONFIRM,
          title: TitlePop.INFORMATION,
          success: true
        });

        this.matRef.close(true);
      } else {
        sessionStorage.setItem("loading", "false");
        await this.generalService.openDialogoGeneral({
          mensaje: "Ocurrió un error al cargar la data.",
          icon: IconPopType.ERROR,
          title: TitlePop.INFORMATION,
          success: true
        });

      }
    }, error => {
      sessionStorage.setItem("loading", "false");
    })
  }

  cancelar() {
    if(this.idProceso){
      this.matRef.close(true);
    }else{
      this.matRef.close(false);
    }
  }

  async upload(data: any) {
    const MAX_FILE_SIZE =  100 * 1024;
    if (data.files) {
      const file = data.files[0];
      if (!file.type.startsWith('image/')) {
        await this.generalService.openDialogoGeneral({
          mensaje: "Solo se permiten archivos de imagen.",
          icon: "warn",
          title: TitlePop.INFORMATION,
          success: true
        });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        await this.generalService.openDialogoGeneral({
          mensaje: "El archivo es demasiado grande. El tamaño máximo permitido es 100 KB",
          icon: "warn",
          title: TitlePop.INFORMATION,
          success: true
        });
        return;
      }
      this.imagenSeleccionado = data.files[0];
      try {
        const result = await this.toBase64(file) as any;
        this.logo = result;
      } catch (error) {
        console.error(error);
        return;
      }
    }
  }

  async guardar() {
    if (this.imagenSeleccionado.size === 0) {
      await this.generalService.openDialogoGeneral({
        mensaje: "Logo es obligatorio",
        icon: IconPopType.ALERT,
        title: TitlePop.INFORMATION,
        success: true
      });
      return;
    }
    let data = {
      ...this.formGroupParent.getRawValue(),
      vigente: 1
    };
    const fecha = data.fechaConvocatoria;
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Sumar 1 porque los meses son 0-indexados
    const dia = String(fecha.getDate()).padStart(2, '0');
    data.fechaConvocatoria = `${anio}-${mes}-${dia}`;
    this.configuracionProcesoService.update(data, this.imagenSeleccionado).subscribe(async (response) => {
      if (response.success) {
        await this.generalService.openDialogoGeneral({
          mensaje: "Proceso guardado correctamente",
          icon: IconPopType.CONFIRM,
          title: TitlePop.INFORMATION,
          success: true
        });

        this.idProceso = response.data.id;
        this.matRef.close(true);

      }
    }, async (error) => {
      let erro = error?.error?.message ?? "";
      await this.generalService.openDialogoGeneral({
        mensaje: erro.split(":")[1],
        icon: IconPopType.ALERT,
        title: TitlePop.INFORMATION,
        success: true
      });
    })

  }

  toBase64 = (fileImg: any) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(fileImg);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  filtroFechaHabil = (d: Date | null): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d ? d >= today : false;
  }

}
