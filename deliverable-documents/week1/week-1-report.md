# Week 1

## Objetivo

- Entender qué es AI Engineering y en qué se diferencia del software tradicional.
- Delimitar el problema de Peladito Architect: qué tareas necesitan un LLM y cuáles deben ser deterministas.
- Diseñar tu primera taxonomía de intenciones.
- Armar la v0 de tu corpus documental.
- Crear tu dataset de evaluación inicial.

## Hipótesis

Esta aplicacion va estar enfocandose en el area de "Application development" no profundizando en Model development ni Infraestructura.
Voy a usar prompt-based techniques, adaptando el modelo dando instrucciones y contexto, sin cambiar el propio modelo.

## Cambios

## Decisiones
¿Por qué elegí esta solución?

- Rol de la IA en el peladito architect:
  - Rol complementario, no toma decisiones, solo da soporte a decisiones humanas
  - Reactiva, ante un input fabrica una respuesta
  - Estatico, modelo no cambia ni si adapta a usuarios especificos

- Agreue intenciones:

| Intención                 | Acción                                                | Detalle                                                |
|---------------------------|-------------------------------------------------------|--------------------------------------------------------|
| `EXLAIN_DECISION_HISTORY` | Recuperar evidencia del historica de una decision     | Explicar el historico/trazabilidad de alguna decision  |

- Propuse que etapas van a ser deterministas o van a usar IA.

## Alternativas
¿Qué otras opciones consideré?

- Usar tambien OpenAI tambien ?

- Enriquecer corpus con meetings y agregar un nuevo tipo de documentos y quiza tambien intencion asociada

- Es necesario proveer al modelo con la historia de ciertos documentos (por estar versionados) o siempre dar la ultima version ? Soportar consultas historicas para lo que agregue una nueva intension `EXLAIN_DECISION_HISTORY` para asi agregar al contexto historico de documentos ?

- Dado que los LLM mejoran dia a dia puede ser plausible que este wrapper no tenga sentido, ser un simple claude wrapper, todas sus funcionalidades no logren mejoren la calidad de las respuestas dadas por un LLM directamente. Por eso es necesario evaular su rendimiento contra un uso directo del LLM seteando un porcentage minimo de mejora esperada contra un uso directo del LLM por ejemplo usando obsidian ?

## Evidencia
¿Qué resultados obtuve?

## Evaluación
¿Qué casos probé?

## Costos
0

## Latencia
¿Qué tiempos observé?

## Fallos
¿Qué sigue fallando?

## Uso de AI
¿Qué recomendaciones de Claude u OpenAI acepté, modifiqué o rechacé?

## Aprendizaje

Comprendi conceptos generales de las LLMs, que evaluar para justificar su uso, y que etapas del flujo clasico de un prompt son parametrizables.

## Próximo riesgo

El corpus inicial sea trivial, poco elaborado, para dar una buena evaluacion del producto desarrollado 
