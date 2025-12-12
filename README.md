# 🇲🇽 Validador de RFC y CURP

Este proyecto es una utilidad de software diseñada para facilitar la validación y cálculo de los documentos de identificación fiscal y poblacional en México: **RFC** (Registro Federal de Contribuyentes) y **CURP** (Clave Única de Registro de Población).

El algoritmo implementa las reglas estandarizadas oficiales (SAT y RENAPO), manejando casos especiales, nombres comunes y cálculo de homoclave.

## Características

* **Generación de RFC:**
    * Personas Físicas (con Homoclave).
    * Soporte para reglas de nombres compuestos (María/José).
* **Generación de CURP:**
    * Cálculo basado en datos personales y entidad federativa.
    * Dígito verificador.
* **Manejo de Excepciones:**
    * Soporte para caracteres especiales (Ñ, diéresis).
    * Filtro de palabras inconvenientes (las "groserías" que el sistema oficial evita en las siglas).
* **Validación:** Comprobación de formato (Regex) y estructura válida.
