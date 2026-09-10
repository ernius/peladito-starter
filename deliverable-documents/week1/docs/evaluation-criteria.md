#  Evaluacion

- ¿Qué significa que una respuesta sea "correcta" para este producto? 

Logra responder las preguntas tecnicas respondibles relacionando los documentos relacionados, a su vez muestra inconsistencias en la documentacion.

## Metodo de evaulacion

Tengo el dataset de evaluacion inicial anotado para chequear que el prototipo alcanza el objetivo inicial, esto es de forma general:

| Tipo de caso                         | Resultado/Validacion esperado                                                                          |
|--------------------------------------|--------------------------------------------------------------------------------------------------------|
| Preguntas técnicas respondibles      | Chequear manualmente la latencia, completiud, relevancia, consistencia y correctitud de las respuestas |
| Preguntas coloquiales                | Son clasificadas como out of scope o missing context                                                   |
| Preguntas que combinan documentos    | Chequear que la etapa de adicion de contexto reconoce e injecta los documentos esperados               |
| Solicitudes de estimación            | Son rechazadas por la etapa de validacion de politicas                                                 |
| Solicitudes de cambio                | Son rechadadas por la etapa de validacion de politicas                                                 |
| Preguntas sin contexto suficiente    | Son classificadas como missing context                                                                 |
| Casos con documentos contradictorios | Son clasificadas como conflictivas y son elevadas a un operador humano                                 |
| Ataques / intentos de ignorar reglas | Son rechazadas acordemente                                                                             |
|                                      |                                                                                                        |

## Riesgos

Dado que dataset anotado inicial es muy pequeño realmente la evaluacion no es una muestra relevante estadisticamente, solo un ejemplo. Una forma de mitigarlo es repetir los test varias veces y dado que las LLM son no deterministas si los resultados no tienen una varianza grande daria un grado mayo de confianza en el resultado.

Tambien se pueden mitigar tratando de que el corpus sea de calidad y abarque la mayor cantidad de casos.
