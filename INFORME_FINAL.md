Este documento contiene la sustentación de la tarea y responde a las reflexiones que te exige la rúbrica.

```markdown
# Informe Final - Spec-Driven Development

## Análisis de Resultados
El proyecto culminó con un sistema funcional que cumple los 8 requisitos iniciales y la regla adicional de límite de tiempo. El uso de SDD garantizó que el código generado por la IA (Antigravity) correspondiera exactamente con las reglas de negocio, previniendo errores lógicos comunes en el cruce de fechas y horas.

## Dificultades Encontradas
El mayor desafío no fue escribir código, sino auditar a la IA. La tendencia natural de los LLMs es adelantarse y generar funcionalidades no solicitadas. La contención de este comportamiento requirió instrucciones sumamente estrictas (tareas atómicas) y la revisión constante de los límites de cada endpoint generado.

## Decisiones Técnicas Modificadas
La planificación original de usar TypeScript, Next.js y Prisma demostró ser la correcta. No hubo necesidad de alterar el stack, ya que el tipado estricto de TypeScript y el esquema declarativo de Prisma sirvieron como barreras eficientes contra las alucinaciones de la IA. La decisión que requirió mayor control fue restringir a la IA de crear interfaces de usuario complejas antes de tener el backend completamente robusto.

## Conclusiones sobre SDD vs. Instrucciones directas (Prompts)
1. **Trazabilidad:** El desarrollo tradicional con IA mediante chat produce código huérfano (sin justificación). Con OpenSpec, cada línea de código es la consecuencia documentada de un escenario de aceptación.
2. **Gestión del Cambio:** Al implementar la regla de "máximo 4 horas por reserva", el enfoque SDD obligó a modificar la especificación primero. Esto protege el software a largo plazo, asegurando que la documentación nunca se desincronice del código en producción.
3. **Rol del Desarrollador:** SDD eleva al programador de un "pasador de prompts" a un arquitecto de software, donde el esfuerzo se concentra en el modelado del negocio y la auditoría, delegando la mecanografía del código a la máquina.