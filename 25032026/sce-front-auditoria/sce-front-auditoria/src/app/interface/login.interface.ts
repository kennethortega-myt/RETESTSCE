export interface ILoginRequest{
    usuario: string;
    clave: string;
}

export interface ILoginResponse{
    success: string;
    message: string;
    token: string;
}