export class ItemBean{
  private _ID: string;
  private _DESCRIPCION: string;

  constructor(ID: string, DESCRIPCION: string) {
    this._ID = ID;
    this._DESCRIPCION = DESCRIPCION;
  }


  get ID(): string {
    return this._ID;
  }

  set ID(value: string) {
    this._ID = value;
  }

  get DESCRIPCION(): string {
    return this._DESCRIPCION;
  }

  set DESCRIPCION(value: string) {
    this._DESCRIPCION = value;
  }

}
