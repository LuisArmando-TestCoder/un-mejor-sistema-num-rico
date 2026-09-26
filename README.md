# un-mejor-sistema-num-rico

## Research — Sistema numérico exponencial (escala cuadrática)

### Problema

Los idiomas nombran números grandes con dos escalas incompatibles:

| Término            | Escala corta (inglés) | Escala larga (español) |
| ------------------ | --------------------- | ---------------------- |
| Billón              | 10^9                  | 10^12                  |
| Trillón             | 10^12                 | 10^18                  |
| Trillón trillón     | 10^24 (septillion)    | 10^36 (sextillón)      |

La escala larga (Nicolas Chuquet, s. XV) avanza de millón en millón:
el prefijo latino indica la potencia del millón (billón = millón², 10^12;
trillón = millón³, 10^18; cuatrillón = millón⁴, 10^24). Eso obliga a
memorizar un nombre nuevo cada 6 ceros: octillón, nonillón, decillón...

### Este sistema

Regla única: cada unidad es el **cuadrado de la anterior**. "Un X de X" es la
siguiente unidad:

- un millón de millones = un billón (10^12)
- un billón de billones = un trillón (10^24)
- un trillón de trillones = un cuatrillón (10^48)
- un cuatrillón de cuatrillones = un quintillón (10^96)

Los ceros de la unidad de nivel n son: `6 × 2^(n-1)`:

| Nivel | Nombre      | Valor  |
| ----- | ----------- | ------ |
| 1     | millón      | 10^6   |
| 2     | billón      | 10^12  |
| 3     | trillón     | 10^24  |
| 4     | cuatrillón  | 10^48  |
| 5     | quintillón  | 10^96  |
| ...   | ...         | ...    |

Ventajas: con muy pocos nombres se cubren magnitudes gigantescas, y la
relación "X de X = siguiente" es autoevidente. Costo: los números entre
niveles se leen componiendo la unidad inferior ("dos millones de billones"
en vez de "dos trillones" de la escala larga). Es el mismo espíritu con el
que la computación encadena unidades (KB × KB ≈ MB... hacia arriba).

Los prefijos no viven en una lista fija: se generan combinando raíces latinas
(unidades + decenas + centenas), igual que los ordinales cultos (un-décimo,
duo-vigésimo), con ajuste fonético "-im" tras "dec" para que "undec" + "illón"
suene "undecimillón". El sistema es infinito.

## Uso

```ts
import traducir from "./index";

traducir(1_000_000n);
// "un millón"

traducir("1" + "0".repeat(24));
// "un trillón"   (un billón de billones)

traducir(239847239048092384982903423023n);
// "doscientos treinta y nueve mil ochocientos cuarenta y siete trillones
//  con doscientos treinta y nueve mil cuarenta y ocho millones noventa y
//  dos mil trescientos ochenta y cuatro billones con novecientos ochenta
//  y dos mil novecientos tres millones con cuatrocientos veintitrés mil
//  veintitrés"
```

Acepta `bigint` o `string` de dígitos (sin límite de tamaño). También se
exportan las piezas: `generarPrefijoLatino(orden)` para obtener la raíz del
nivel n, y `numeroAWords(bigint)` para leer cantidades en palabras (usa la
escala larga estándar solo para leer las cantidades internas de cada bloque,
que es como se lee español fluido).

## Tests (Deno)

El archivo `index_test.ts` cubre 11 casos: números por debajo de un millón,
las unidades base del sistema, plurales, residuos con " con ", un número
mixto grande, entrada por `string`, rechazo de negativos, el convertidor
auxiliar `numeroAWords`, los prefijos generativos y un nivel profundo
(orden 11, 10^6144).

Ejecución:

```sh
deno test --allow-all index_test.ts
```

Salida esperada (resumida):

```
running 11 tests from ./index_test.ts
traducir: números por debajo de un millón ... ok
traducir: unidades base del sistema exponencial ... ok
traducir: plurals ... ok
traducir: residuos con ' con ' ... ok
traducir: número mixto grande ... ok
traducir: acepta string ... ok
traducir: rechaza negativos ... ok
numeroAWords: escala larga estándar para leer cantidades ... ok
generarPrefijoLatino: base y generativo ... ok
generarPrefijoLatino: rechaza órdenes inválidos ... ok
traducir: nivel generativo profundo (orden 11, 10^6144) ... ok

ok | 11 passed | 0 failed (6ms)
```

## Pipeline completo

El script `run-pipeline.sh` regenera un log íntegro del pipeline en
`pipeline.log`: encabezado con versión de Deno y revisión de git, `deno check`,
los tests con nivel de log `debug`, una tabla de prefijos para los niveles
1..500, una cascada de traducciones de números crecientes, 200 números mixtos
de estrés, y el volcado completo de `index.ts` e `index_test.ts`.

```sh
./run-pipeline.sh
# -> pipeline.log écrit : 1141 lines, 139701 octets
```
