import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

import { JSEncrypt } from 'jsencrypt';

export interface PublicKeyResponse {
  publicKey: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class RSAEncryptionService {

  private readonly apiUrlSeguridad = environment.apiUrlSeguridad;
  private publicKey: string = '';

  constructor(private readonly http: HttpClient) {}

  async getPublicKey(): Promise<string> {
    if (!this.publicKey) {
      try {
        const response = await firstValueFrom(
          this.http.get<PublicKeyResponse>(`${this.apiUrlSeguridad}/api/auth/public-key`)
        );
        this.publicKey = response.publicKey;
      } catch (error) {
        console.error('Error obteniendo clave pública:', error);
        throw error;
      }
    }
    return this.publicKey;
  }

  async encryptPassword(password: string): Promise<string> {
    try {
      const publicKey = await this.getPublicKey();

      const encrypt = new JSEncrypt();
      encrypt.setPublicKey(publicKey);

      const encrypted = encrypt.encrypt(password);
      if (!encrypted) {
        throw new Error('Error encriptando contraseña');
      }

      return encrypted;

    } catch (error) {
      console.error('Error en encriptación RSA:', error);
      throw error;
    }
  }

  clearPublicKey(): void {
    this.publicKey = '';
  }
}
