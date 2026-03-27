import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {UsuarioService} from "../../../service/usuario.service";
import {IUsuario} from "../../../interface/usuario.interface";
import {GeneralService} from "../../../service/general-service.service";
import {UtilityService} from '../../../helper/utilityService';
import {Usuario} from '../../../model/usuario-bean';
import {AuthComponent} from '../../../helper/auth-component';
import {IconPopType} from '../../../model/enum/iconPopType';

@Component({
  selector: 'app-cierre-sesiones',
  templateUrl: './cierre-sesiones.component.html',
  styleUrls: ['./cierre-sesiones.component.scss']
})
export class CierreSesionesComponent extends AuthComponent implements AfterViewInit, OnInit {

  search: string = '';

  titulo: string = 'Cierre de sesiones';
  public usuario: Usuario;

  listUsuarios: IUsuario[] = [];
  @ViewChild(MatTable, {static: true}) table: MatTable<any> =
    Object.create(null);

  displayedColumns: string[] = [
    '#',
    'usuario',
    'nombre',
    'apellidoPaterno',
    'apellidoMaterno',
    'centro',
    'sesion',
    'accion'
  ];

  dataSource = new MatTableDataSource(this.listUsuarios);
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator =
    Object.create(null);

  totalRegistro: number = 0;
  page: number = 0;
  pageSize: number = 10;
  clearSearch: boolean = false;

  constructor(private readonly usuarioService: UsuarioService,
              private readonly generalService: GeneralService,
              private readonly utilityService: UtilityService) {
    super();

  }


  ngOnInit(): void {
    this.cargarLogs(this.page, this.pageSize, this.search);

    this.usuario = this.authentication();

    console.log(this.usuario);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }


  buscar(){
    if (!this.search) {
      this.clearSearch = false;
    }else this.clearSearch = true;

    this.cargarLogs(0, 100, this.search);
  }

  clear() {
    this.clearSearch = false;
    this.search = '';
    this.cargarLogs(this.page, this.pageSize, this.search);
  }

  getRowIndex(index: number): number {
    return index + 1 + this.paginator.pageIndex * this.paginator.pageSize;
  }

  eventosPaginador(event: PageEvent) {
    this.totalRegistro = event.length;
    this.pageSize = event.pageSize;
    this.page = event.pageIndex;
    this.cargarLogs(this.page, this.pageSize, this.search);
  }

  private cargarLogs(page, size, search){
    this.usuarioService.usuarios$.subscribe(data => {
      this.listUsuarios = data.list;
      this.totalRegistro = data.total;
      this.dataSource = new MatTableDataSource(this.listUsuarios);
    });
    this.usuarioService.listUsuariosSesionActiva(page, size, search);
  }

  cerrarSesion(data: IUsuario){
    this.generalService.openDialogoGeneral({
      mensaje: `¿Está seguro de cerrar la sesión activa del usuario ${data.usuario} ?`,
      icon: "questions",
      title: this.titulo,
      success: true,
      isQuestion: true
    }).then(resp => {
      resp.afterClosed().subscribe(result => {
        if (result) {
          this.usuarioService.resetSesionActiva(data.usuario).subscribe({
            next: (response) => {
                this.generalService.openDialogoGeneral({
                  mensaje: response.message,
                  icon: IconPopType.CONFIRM,
                  title: this.titulo,
                  success: false
                });
                data.sesionActiva = 0;
            },
            error: (error) => {
              let mensaje = this.utilityService.manejarMensajeError(error);
              this.generalService.openDialogoGeneral({
                mensaje: mensaje,
                icon: IconPopType.ERROR,
                title: this.titulo,
                success: true
              });
            }
          });
        }
      })
    });
  }

}
