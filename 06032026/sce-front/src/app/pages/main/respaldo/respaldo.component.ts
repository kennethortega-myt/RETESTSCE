import {AfterViewInit, Component, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {BackupRestauracionService} from '../../../service/backup-restore.service';
import {IRespaldoDto} from '../../../interface/general.interface';
import {finalize} from 'rxjs/operators';
import {HttpErrorResponse, HttpEventType} from '@angular/common/http';
import {GeneralService} from '../../../service/general-service.service';
import {IconPopType, TitlePop} from '../../../model/enum/iconPopType';

@Component({
  selector: 'app-respaldo',
  templateUrl: './respaldo.component.html'
})
export class RespaldoComponent implements OnInit, AfterViewInit {
  progreso: number = 0;
  descargando: boolean = false;

  readonly displayedColumns: string[] = [
    '#',
    'fecha',
    'archivo',
    'acciones',
  ];
  dataSource = new MatTableDataSource<IRespaldoDto>([]);

  constructor(private readonly backrestoreService: BackupRestauracionService, private generalService: GeneralService) {
  }

  ngOnInit(): void {
    this.cargar();
  }

  ngAfterViewInit(): void {

  }
  descargar(nombre: string){
    this.descargando = true;
    this.progreso = 0;
    this.backrestoreService.descargar(nombre)
      .subscribe(event => {

        if (event.type === HttpEventType.DownloadProgress) {

          if (event.total) {
            this.progreso = Math.round(100 * event.loaded / event.total);
          }

        } else if (event.type === HttpEventType.Response) {

          const blob = event.body!;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');

          a.href = url;
          a.download = nombre;
          a.click();

          window.URL.revokeObjectURL(url);

          this.descargando = false;
        }

      }, error => {
        console.error(error);
        this.descargando = false;
      });
  }

  listar(){
    this.backrestoreService.listar().subscribe(response=>{
      console.log(response);
    })
  }

  cargar(): void {
    sessionStorage.setItem('loading', 'true');
    this.backrestoreService.listar()
      .pipe(
        finalize(() => {
          sessionStorage.setItem('loading', 'false');
        })
      )
      .subscribe({
        next: resp => {
          this.dataSource = new MatTableDataSource<IRespaldoDto>(resp.data);
        },
        error: err => {
          this.controlarError(err);
        }
      });
  }
  controlarError(err: HttpErrorResponse){
     this.generalService.openDialogoGeneral({
      mensaje: err.error?.message ?? '',
      icon: IconPopType.ERROR,
      title: TitlePop.INFORMATION,
      success: true
    });
  }

}
