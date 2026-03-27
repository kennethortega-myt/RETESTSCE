export class ResponseGeneralBean {
  private _status: string;
  private _code: string;
  private _message: string;
  private _data: any;


	constructor(status: string, code: string, message: string, data: any) {
		this._status = status;
		this._code = code;
		this._message = message;
		this._data = data;
	}


    /**
     * Getter status
     * @return {string}
     */
	public get status(): string {
		return this._status;
	}

    /**
     * Getter code
     * @return {string}
     */
	public get code(): string {
		return this._code;
	}

    /**
     * Getter message
     * @return {string}
     */
	public get message(): string {
		return this._message;
	}

    /**
     * Getter data
     * @return {any}
     */
	public get data(): any {
		return this._data;
	}

    /**
     * Setter status
     * @param {string} value
     */
	public set status(value: string) {
		this._status = value;
	}

    /**
     * Setter code
     * @param {string} value
     */
	public set code(value: string) {
		this._code = value;
	}

    /**
     * Setter message
     * @param {string} value
     */
	public set message(value: string) {
		this._message = value;
	}

    /**
     * Setter data
     * @param {any} value
     */
	public set data(value: any) {
		this._data = value;
	}

}
