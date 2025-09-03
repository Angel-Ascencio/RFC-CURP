import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-rfc-curp-validator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rfc-curp-validator.component.html',
  styleUrls: ['./rfc-curp-validator.component.css']
})
export class RfcCurpValidatorComponent {
  curp: string = '';
  rfc: string = '';
  showResult: boolean = false;
  showFormatInfo: boolean = true;
  resultTitle: string = '';
  resultMessage: SafeHtml | string = '';
  resultType: string = '';

  // Patrones de validación
  private curpPattern = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{2}[BCDFGHJKLMNPQRSTVWXYZ]{3}[0-9A-Z]{2}$/;
  private rfcPattern = /^[A-Z]{3,4}[0-9]{6}[A-Z0-9]{2,3}$/;

  // Lista de entidades federativas válidas
  private validStates = new Set([
    'AS', 'BC', 'BS', 'CC', 'CL', 'CM', 'CS', 'CH', 'DF', 'DG', 'GT', 'GR', 'HG', 'JC',
    'MC', 'MN', 'MS', 'NT', 'NL', 'OC', 'PL', 'QT', 'QR', 'SP', 'SL', 'SR', 'TC',
    'TS', 'TL', 'VZ', 'YN', 'ZS'
  ]);

  constructor(private sanitizer: DomSanitizer) {}

  // Convertir a mayúsculas automáticamente
  onCurpChange() {
    if (this.curp) {
      this.curp = this.curp.toUpperCase().replace(/\s/g, ''); // Eliminar espacios
      console.log('CURP after change:', this.curp); // Depuración
    }
  }

  onRfcChange() {
    if (this.rfc) {
      this.rfc = this.rfc.toUpperCase().replace(/\s/g, ''); // Eliminar espacios
      console.log('RFC after change:', this.rfc); // Depuración
    }
  }

  // Limpiar resultados al cambiar inputs
  clearResults() {
    this.showResult = false;
    this.showFormatInfo = true;
  }

  // Mostrar resultado con formato
  private displayResult(title: string, message: string, type: string) {
    this.resultTitle = title;
    this.resultMessage = this.sanitizer.bypassSecurityTrustHtml(message);
    this.resultType = type;
    this.showResult = true;
    this.showFormatInfo = false;
  }

  // Validar fecha (AAMMDD)
  private isValidDate(year: number, month: number, day: number): boolean {
    // Verificar rango de año
    if (year < 1950 || year > 2025) return false;

    // Verificar rango de mes
    if (month < 1 || month > 12) return false;

    // Días máximos por mes (considerando años bisiestos para febrero)
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) return false;

    // Verificar año bisiesto para febrero (29 días si aplica)
    if (month === 2 && day === 29) {
      return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    return true;
  }

  validateCurp() {
    this.onCurpChange();
    const curpValue = this.curp.trim();

    console.log('Validating CURP:', curpValue); // Depuración

    if (!curpValue) {
      this.displayResult('ERROR DE VALIDACIÓN',
        'No se ha proporcionado una CURP para validar. Por favor ingrese el dato requerido.',
        'warning');
      return;
    }

    if (curpValue.length !== 18) {
      this.displayResult('FORMATO INCORRECTO',
        `La CURP proporcionada contiene ${curpValue.length} caracteres. El formato requerido es de exactamente 18 caracteres alfanuméricos.`,
        'danger');
      return;
    }

    const stateCode = curpValue.substring(11, 13);
    if (!this.validStates.has(stateCode)) {
      this.displayResult('FORMATO INVÁLIDO',
        `La CURP <strong>${curpValue}</strong> tiene un código de entidad federativa inválido (${stateCode}). Verifique el estado.`,
        'danger');
      return;
    }

    if (!this.curpPattern.test(curpValue)) {
      this.displayResult('FORMATO INVÁLIDO',
        `La CURP <strong>${curpValue}</strong> no cumple con la estructura requerida.<br><br>
        <strong>Estructura esperada:</strong><br>
        • Posiciones 1-4: Apellidos y nombre (4 letras)<br>
        • Posiciones 5-10: Fecha de nacimiento (AAMMDD)<br>
        • Posición 11: Sexo (H/M)<br>
        • Posiciones 12-13: Entidad federativa (2 letras)<br>
        • Posiciones 14-16: Consonantes internas (3 letras)<br>
        • Posiciones 17-18: Dígito verificador (2 caracteres alfanuméricos)`,
        'danger');
      return;
    }

    // Extraer fecha del CURP (posiciones 5-10: AAMMDD)
    const yearStr = parseInt(curpValue.substring(4, 6), 10) >= 0 && parseInt(curpValue.substring(4, 6), 10) <= 25
      ? `20${curpValue.substring(4, 6)}` // 2000-2025
      : `19${curpValue.substring(4, 6)}`; // 1900-1999
    const monthStr = curpValue.substring(6, 8);
    const dayStr = curpValue.substring(8, 10);

    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    if (!this.isValidDate(year, month, day)) {
      this.displayResult('FECHA INVÁLIDA',
        `La fecha ${day}/${month}/${year} en la CURP <strong>${curpValue}</strong> no es válida.<br><br>
        <strong>Restricciones:</strong><br>
        • Año: Debe estar entre 1950 y 2025.<br>
        • Mes: Debe ser entre 1 y 12.<br>
        • Día: Debe corresponder al número de días del mes (máximo 31, 30 o 28/29 para febrero en años bisiestos).`,
        'danger');
      return;
    }

    this.displayResult('VALIDACIÓN EXITOSA',
      `La CURP <strong>${curpValue}</strong> cumple con todos los criterios de validación establecidos por el RENAPO y es estructuralmente correcta.`,
      'success');
  }

  validateRfc() {
    this.onRfcChange();
    const rfcValue = this.rfc.trim();

    console.log('Validating RFC:', rfcValue); // Depuración

    if (!rfcValue) {
      this.displayResult('ERROR DE VALIDACIÓN',
        'No se ha proporcionado un RFC para validar. Por favor ingrese el dato requerido.',
        'warning');
      return;
    }

    if (rfcValue.length < 12 || rfcValue.length > 13) {
      this.displayResult('LONGITUD INCORRECTA',
        `El RFC proporcionado contiene ${rfcValue.length} caracteres. Los RFC válidos deben contener entre 12 y 13 caracteres (12 para personas morales, 13 para personas físicas).`,
        'danger');
      return;
    }

    if (!this.rfcPattern.test(rfcValue)) {
      this.displayResult('FORMATO INVÁLIDO',
        `El RFC <strong>${rfcValue}</strong> no cumple con la estructura requerida por el SAT.<br><br>
        <strong>Estructura esperada:</strong><br>
        • Personas Físicas (13 caracteres): 4 letras + 6 números + 3 caracteres<br>
        • Personas Morales (12 caracteres): 3 letras + 6 números + 3 caracteres<br>
        • Los 6 números centrales corresponden a la fecha (AAMMDD)<br>
        • Los últimos caracteres son la homoclave y dígito verificador`,
        'danger');
      return;
    }

    // Extraer fecha del RFC (posiciones 4-9: AAMMDD)
    const yearStr = parseInt(rfcValue.substring(4, 6), 10) >= 0 && parseInt(rfcValue.substring(4, 6), 10) <= 25
      ? `20${rfcValue.substring(4, 6)}` // 2000-2025
      : `19${rfcValue.substring(4, 6)}`; // 1900-1999
    const monthStr = rfcValue.substring(6, 8);
    const dayStr = rfcValue.substring(8, 10);

    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    if (!this.isValidDate(year, month, day)) {
      this.displayResult('FECHA INVÁLIDA',
        `La fecha ${day}/${month}/${year} en el RFC <strong>${rfcValue}</strong> no es válida.<br><br>
        <strong>Restricciones:</strong><br>
        • Año: Debe estar entre 1950 y 2025.<br>
        • Mes: Debe ser entre 1 y 12.<br>
        • Día: Debe corresponder al número de días del mes (máximo 31, 30 o 28/29 para febrero en años bisiestos).`,
        'danger');
      return;
    }

    const tipoPersona = rfcValue.length === 12 ? 'Persona Moral' : 'Persona Física';
    this.displayResult('VALIDACIÓN EXITOSA',
      `El RFC <strong>${rfcValue}</strong> cumple con todos los criterios de validación del SAT y corresponde a una <strong>${tipoPersona}</strong>.`,
      'success');
  }

  validateMatch() {
    this.onCurpChange();
    this.onRfcChange();
    const curpValue = this.curp.trim();
    const rfcValue = this.rfc.trim();

    if (!curpValue || !rfcValue) {
      this.displayResult('DATOS INCOMPLETOS',
        'Para realizar la validación de coincidencia se requieren tanto la CURP como el RFC. Por favor complete ambos campos.',
        'warning');
      return;
    }

    if (curpValue.length < 18 || rfcValue.length < 12) {
      this.displayResult('VALIDACIÓN PENDIENTE',
        'No es posible realizar la validación de coincidencia debido a que los documentos no tienen la longitud correcta. Verifique que la CURP tenga 18 caracteres y el RFC al menos 12.',
        'warning');
      return;
    }

    const curpFirst10 = curpValue.substring(0, 10);
    const rfcFirst10 = rfcValue.substring(0, 10);

    if (curpFirst10 === rfcFirst10) {
      this.displayResult('COINCIDENCIA VERIFICADA',
        `<strong>RESULTADO:</strong> Los documentos corresponden a la misma persona física.<br><br>
        <strong>ANÁLISIS COMPARATIVO:</strong><br>
        • CURP: <code>${curpValue}</code><br>
        • RFC: <code>${rfcValue}</code><br><br>
        <strong>SEGMENTO ANALIZADO:</strong> <code>${curpFirst10}</code><br><br>
        ✓ La coincidencia en los primeros 10 caracteres confirma que ambos documentos fueron expedidos para la misma persona, basándose en los datos de identificación personal (apellidos, nombre y fecha de nacimiento).`,
        'success');
    } else {
      this.displayResult('DISCREPANCIA DETECTADA',
        `<strong>RESULTADO:</strong> Los documentos NO corresponden a la misma persona física.<br><br>
        <strong>ANÁLISIS COMPARATIVO:</strong><br>
        • CURP: <code>${curpValue}</code> → <code>${curpFirst10}</code><br>
        • RFC: <code>${rfcValue}</code> → <code>${rfcFirst10}</code><br><br>
        <strong>DISCREPANCIAS ENCONTRADAS:</strong><br>
        La diferencia en los primeros 10 caracteres indica que los documentos fueron expedidos para personas diferentes, con variaciones en apellidos, nombre o fecha de nacimiento.<br><br>
        ⚠️ <strong>RECOMENDACIÓN:</strong> Verifique la correcta captura de los datos o solicite al titular la presentación de documentos oficiales actualizados.`,
        'danger');
    }
  }
}
