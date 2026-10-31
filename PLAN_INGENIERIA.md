# Plan de Ingeniería de Software: Sistema de Reservas Académicas

## 1. Análisis del problema

*   **Problemática:** La gestión manual de reservas mediante correos electrónicos y hojas de cálculo genera duplicidad de solicitudes, conflictos de horarios (solapamientos) y opacidad en la disponibilidad de los espacios académicos.
*   **Necesidades de la institución:** Centralizar el proceso en una plataforma confiable que valide la disponibilidad en tiempo real y automatice las reglas de negocio.
*   **Actores involucrados:** Usuarios regulares (estudiantes, docentes o administrativos que solicitan espacios) y Administradores (personal encargado de gestionar el inventario de espacios y aprobar o rechazar solicitudes).
*   **Alcance y limitaciones del sistema:** El sistema cubrirá el ciclo de vida completo de la reserva (creación, validación, aprobación/rechazo, cancelación e historial) y estará limitado a la gestión de laboratorios, auditorios y salas de cómputo.

## 2. Propuesta de solución

*   **Descripción general:** Una aplicación web donde los usuarios puedan consultar la disponibilidad de los espacios mediante un calendario interactivo y generar solicitudes. El sistema pre-validará estas solicitudes automáticamente contra las reglas de negocio (ej. prevención de cruces) antes de requerir la intervención humana.
*   **Funcionalidades prioritarias:** Catálogo de espacios, motor de validación de reservas en tiempo real y panel de administración de solicitudes.
*   **Organización en módulos:** 
    1.  Módulo de Autenticación y Usuarios.
    2.  Módulo de Gestión de Espacios (Inventario).
    3.  Módulo Motor de Reservas.
*   **Estrategia progresiva:** Se desarrollará primero el modelo de datos core, seguido de los catálogos básicos (usuarios y espacios). Posteriormente se implementará la lógica compleja del motor de reservas, para finalizar con los flujos de aprobación y roles.

## 3. Decisiones de arquitectura y tecnología

*   **Arquitectura seleccionada y justificación:** Se opta por una arquitectura monolítica basada en componentes (Monorepo). La justificación principal es la "Optimización para Generación por IA". Los modelos de lenguaje actuales cometen menos errores de contexto cuando operan en un solo repositorio, permitiendo a la IA rastrear el flujo completo desde la interfaz hasta la base de datos sin perder el hilo.
*   **Stack tecnológico propuesto:**
    *   **Lenguaje:** TypeScript.
    *   **Framework:** Next.js (React para Frontend y API Routes para Backend).
    *   **ORM:** Prisma (con base de datos SQLite para simplicidad local inicial).
    *   **Estilos:** Tailwind CSS.

*   **Comparación con alternativas descartadas:**
    1.  **TypeScript vs. Python (Lenguaje base):** 
        *   *Decisión:* TypeScript. 
        *   *Justificación:* Aunque las IA tienen mucho entrenamiento en Python, su tipado dinámico permite al agente inventar propiedades o romper estructuras de datos. TypeScript impone un tipado estricto que actúa como una barrera de validación automática garantizando que la IA respete los contratos de datos del SDD.
    2.  **Next.js (Monolito) vs. Frontend/Backend separados (Microservicios):** 
        *   *Decisión:* Next.js. 
        *   *Justificación:* Separar el frontend (ej. React) del backend (ej. Spring Boot o Node) fragmenta el contexto para el agente de IA y aumenta la complejidad para coordinar las actualizaciones de las APIs. El monorepo maximiza la ventana de contexto de la IA.
    3.  **Prisma ORM vs. Consultas SQL Crudas:** 
        *   *Decisión:* Prisma ORM. 
        *   *Justificación:* Prisma utiliza un archivo declarativo (`schema.prisma`) que define toda la base de datos de forma clara y unificada. Escribir SQL crudo introduce riesgos de seguridad por inyección (alucinados por la IA) y dificulta la trazabilidad de los cambios en el modelo de datos.

## 4. Estrategia de desarrollo

*   **Metodología de trabajo:** Spec-Driven Development (SDD) apoyado en OpenSpec. No se escribirá ninguna línea de código sin una especificación formal previa aprobada.
*   **Etapas de implementación:**
    1.  Modelado del esquema de base de datos (Usuarios, Espacios, Reservas).
    2.  Desarrollo del CRUD para Gestión de Espacios y Usuarios.
    3.  Implementación del Motor de Reservas (validación de horarios).
    4.  Sistema de roles, permisos y flujos de aprobación.
*   **Dependencias entre componentes:** El Motor de Reservas depende estrictamente de que los módulos de Usuarios y Espacios estén terminados y probados.
*   **Criterios de terminación:** Una etapa se considera terminada cuando todas las tareas del archivo `tasks.md` de OpenSpec están completas, las pruebas automatizadas pasan (verde) y el código ha sido commiteado al repositorio.

## 5. Estrategia de calidad

*   **Tipos de pruebas:** Pruebas unitarias para las reglas de negocio (especialmente el algoritmo de solapamiento de fechas) y pruebas de integración para el flujo de la base de datos (crear, modificar y cancelar reserva).
*   **Riesgos y Mitigaciones:**
    1.  *Riesgo:* La IA alucina relaciones incorrectas en la base de datos. *Mitigación:* Revisión manual estricta del archivo `schema.prisma` antes de aprobar el código.
    2.  *Riesgo:* Falsos positivos en las pruebas generadas por IA. *Mitigación:* Auditar manualmente las aserciones (asserts) de cada test generado.
    3.  *Riesgo:* El agente pierde el contexto a medida que el proyecto crece. *Mitigación:* Mantener componentes modulares pequeños y apoyarse en la rigidez de TypeScript.
    4.  *Riesgo:* Reservas superpuestas por fallos lógicos sutiles. *Mitigación:* Escribir casos de prueba extremos (edge cases) en OpenSpec enfocados solo en el cruce de horarios.
    5.  *Riesgo:* Caer en la tentación de modificar el código directamente para corregir un bug rápido. *Mitigación:* Disciplina de actualizar primero los requisitos en OpenSpec ante cualquier fallo encontrado.
*   **Mecanismos de verificación:** Integración de un *test runner* que valide automáticamente los escenarios de aceptación descritos en OpenSpec.

## 6. Uso de SDD e inteligencia artificial

*   **Uso de OpenSpec:** Actuará como la fuente única de la verdad. Toda funcionalidad, refactorización o cambio (como la regla de las 4 horas) se documentará primero en sus archivos Markdown (`proposal.md`, `tasks.md`).
*   **Transformación a especificaciones:** El alcance definido en este plan se desglosará en escenarios de comportamiento (Given/When/Then) verificables dentro de las especificaciones de OpenSpec.
*   **Delegación a la IA:** A la IA se le delegará la escritura del código repetitivo (boilerplate), la implementación de la lógica tipada y la generación de la estructura de las pruebas.
*   **Verificación del código:** Se validará exigiendo que el compilador de TypeScript no reporte errores, que la suite de pruebas pase completamente y mediante una revisión de código manual obligatoria por parte del estudiante.
*   **Responsabilidades del estudiante:** Como líder técnico, el estudiante es responsable del diseño arquitectónico, la redacción precisa de las reglas en OpenSpec, la revisión crítica de la seguridad de la aplicación y la gestión del flujo en Git para asegurar la trazabilidad.