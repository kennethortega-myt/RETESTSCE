import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  LOWER_CASE_REGEX,
  NUMERIC_REGEX,
  SPECIAL_CHAR_REGEX,
  UPPER_CASE_REGEX,
} from 'src/app/validators/password-seguro.validator';

@Component({
  selector: 'app-validacion-contrasenia',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './validacion-contrasenia.component.html',
  styleUrl: './validacion-contrasenia.component.scss',
})
export class ValidacionContraseniaComponent {
  readonly contrasenia = input.required<string>();

  readonly validaciones = computed(() => {
    const password = this.contrasenia();
    const passwordLength = password.length;

    return {
      longitud: passwordLength >= 8 && passwordLength <= 20,
      mayusMinux:
        UPPER_CASE_REGEX.test(password) &&
        LOWER_CASE_REGEX.test(password),
      numero: NUMERIC_REGEX.test(password),
      especial: SPECIAL_CHAR_REGEX.test(password),
    };
  });

  readonly porcentaje = computed(() => {
    const v = this.validaciones();
    return (Object.values(v).filter((v) => v).length / 4) * 100;
  });
}
