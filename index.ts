/**
 * ============================================================================
 * RESEARCH — Sistema numérico exponencial (escala cuadrática)
 * ============================================================================
 *
 * PROBLEMA
 * --------
 * Los idiomas nombran números grandes con dos escalas incompatibles:
 *
 *   Término            Escala corta (inglés)   Escala larga (español)
 *   Billón             10^9                    10^12
 *   Trillón            10^12                   10^18
 *   Trillón trillón    10^24 (septillion)      10^36 (sextillón)
 *
 * La escala larga (Nicolas Chuquet, s. XV) avanza de millón en millón:
 * el prefijo latino indica la potencia del millón (billón = millón², 10^12;
 * trillón = millón³, 10^18; cuatrillón = millón⁴, 10^24). Eso obliga a
 * memorizar un nombre nuevo cada 6 ceros: octillón, nonillón, decillón...
 *
 * ESTE SISTEMA
 * ------------
 * Regla única: cada unidad es el CUADRADO de la anterior. "Un X de X" ES la
 * siguiente unidad:
 *
 *   un millón de millones      = un billón      (10^12)
 *   un billón de billones      = un trillón     (10^24)
 *   un trillón de trillones    = un cuatrillón  (10^48)
 *   un cuatrillón de cuatr...  = un quintillón  (10^96)
 *
 * Los ceros de la unidad de nivel n son: 6 × 2^(n-1)
 *   nivel 1 (millón)     -> 10^6
 *   nivel 2 (billón)     -> 10^12
 *   nivel 3 (trillón)    -> 10^24
 *   nivel 4 (cuatrillón) -> 10^48
 *   nivel 5 (quintillón) -> 10^96
 *   ...
 *
 * Ventajas: con muy pocos nombres se cubren magnitudes gigantescas, y la
 * relación "X de X = siguiente" es autoevidente. Costo: los números entre
 * niveles se leen componiendo la unidad inferior ("dos millones de billones"
 * en vez de "dos trillones" de la escala larga). Es el mismo espíritu con el
 * que la computación encadena unidades (KB × KB ≈ MB... hacia arriba).
 *
 * Los prefijos no viven en una lista fija: se GENERAN combinando raíces
 * latinas (unidades + decenas + centenas), igual que los ordinales cultos
 * (un-décimo, duo-vigésimo), con ajuste fonético "-im" tras "dec" para que
 * "undec" + "illón" suene "undecimillón". El sistema es infinito.
 *
 * ============================================================================
 * USO
 * ============================================================================
 *
 *   import traducir from "./sistema-numerico";
 *
 *   traducir(1_000_000n);
 *   // "un millón"
 *
 *   traducir("1" + "0".repeat(24));
 *   // "un trillón"   (un billón de billones)
 *
 *   traducir(239847239048092384982903423023n);
 *   // "doscientos treinta y nueve mil ochocientos cuarenta y siete trillones
 *   //  con doscientos treinta y nueve mil cuarenta y ocho millones noventa y
 *   //  dos mil trescientos ochenta y cuatro billones con novecientos ochenta
 *   //  y dos mil novecientos tres millones con cuatrocientos veintitrés mil
 *   //  veintitrés"
 *
 * Acepta `bigint` o `string` de dígitos (sin límite de tamaño). También se
 * exportan las piezas: `generarPrefijoLatino(orden)` para obtener la raíz del
 * nivel n, y `numeroAWords(bigint)` para leer cantidades en palabras (usa la
 * escala larga estándar solo para leer las cantidades internas de cada
 * bloque, que es como se lee español fluido).
 *
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Prefijos generativos (raíces latinas: unidades + decenas + centenas)
// ---------------------------------------------------------------------------

const UNIDADES_LATINAS = ["", "un", "duo", "tre", "cuator", "quin", "se", "septem", "octo", "novem"];
const DECENAS_LATINAS = ["", "dec", "vigen", "trigen", "cuadragen", "quincuagen", "sexagen", "septuagen", "octogen", "nonagen"];
const CENTENAS_LATINAS = ["", "cent", "ducent", "trecent", "cuadringent", "quingent", "sexgent", "septingent", "octingent", "nongent"];

const PREFIJOS_BASE = ["", "m", "b", "tr", "cuatr", "quint", "sext", "sept", "oct", "non", "dec"];

/**
 * Prefijo del nivel `orden` (1 = m, 2 = b, 3 = tr, ... 11 = undecim, ...).
 * Generativo e infinito: combina raíces latinas para cualquier orden > 10.
 */
export function generarPrefijoLatino(orden: number): string {
  if (!Number.isInteger(orden) || orden < 1) {
    throw new RangeError(`Orden inválido: ${orden}`);
  }
  if (orden <= 10) return PREFIJOS_BASE[orden];

  const u = orden % 10;
  const d = Math.floor((orden % 100) / 10);
  const c = Math.floor(orden / 100);

  // Regla clásica: la unidad va antes de la decena (un-décimo, duo-vigésimo)
  let prefijo = CENTENAS_LATINAS[c] + UNIDADES_LATINAS[u] + DECENAS_LATINAS[d];

  // Ajuste fonético: "dec" + "illón" -> "decimillón"
  if (prefijo.endsWith("dec")) prefijo += "im";

  return prefijo;
}

// ---------------------------------------------------------------------------
// Números a palabras en español (para leer las cantidades de cada bloque)
// ---------------------------------------------------------------------------

const UNIDADES = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
const ESPECIALES = ["diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];
const VEINTES = ["veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"];
const DECENAS = ["", "diez", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
const CENTENAS = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

/** 0–999 en palabras. */
function tresDigitos(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cien";

  const c = Math.floor(n / 100);
  const resto = n % 100;
  const d = Math.floor(resto / 10);
  const u = resto % 10;

  const partes: string[] = [];
  if (c > 0) partes.push(CENTENAS[c]);

  if (resto > 0) {
    if (d === 1) partes.push(ESPECIALES[u]);
    else if (d === 2) partes.push(VEINTES[u]);
    else if (d >= 3) partes.push(u > 0 ? `${DECENAS[d]} y ${UNIDADES[u]}` : DECENAS[d]);
    else partes.push(UNIDADES[u]);
  }

  return partes.join(" ");
}

/** 0–999999 en palabras ("un mil" -> "mil", "uno mil" -> "un mil"). */
function seisDigitos(n: number): string {
  if (n === 0) return "cero";

  const miles = Math.floor(n / 1000);
  const resto = n % 1000;
  const partes: string[] = [];

  if (miles > 0) {
    if (miles === 1) {
      partes.push("mil");
    } else {
      // Apócope antes de "mil": "veintiuno mil" -> "veintiún mil"
      const texto = tresDigitos(miles).replace(/uno$/, "ún").replace(/^uno$/, "un");
      partes.push(`${texto} mil`);
    }
  }
  if (resto > 0) partes.push(tresDigitos(resto));

  return partes.join(" ");
}

/**
 * Convierte cualquier bigint no negativo a palabras usando la lectura fluida
 * del español (agrupando de 6 en 6: millón, billón, trillón... escala larga
 * estándar, SOLO para leer cantidades internas — la estructura de bloques
 * grande la decide `traducir` con la escala exponencial).
 */
export function numeroAWords(n: bigint): string {
  if (n < 0n) throw new RangeError("Solo números no negativos");
  if (n < 1_000_000n) return seisDigitos(Number(n));

  const str = n.toString();
  // Nivel de la escala larga estándar: grupos de 6 dígitos
  const k = Math.floor((str.length - 1) / 6);
  const base = 10n ** BigInt(6 * k);
  const cantidad = n / base; // siempre < 10^6
  const resto = n % base;

  const prefijo = generarPrefijoLatino(k);
  const cabeza =
    cantidad === 1n ? `un ${prefijo}illón` : `${seisDigitos(Number(cantidad))} ${prefijo}illones`;

  return resto > 0n ? `${cabeza} ${numeroAWords(resto)}` : cabeza;
}

// ---------------------------------------------------------------------------
// Traductor principal — escala exponencial pura
// ---------------------------------------------------------------------------

/**
 * Traduce un bigint (o string de dígitos) a palabras usando el sistema
 * exponencial: la unidad de nivel n tiene 6 × 2^(n-1) ceros, y los residuos
 * se encadenan con " con " de forma recursiva.
 */
export function traducir(numero: bigint | string): string {
  const n = typeof numero === "string" ? BigInt(numero) : numero;
  if (n < 0n) throw new RangeError("Solo números no negativos");

  const totalCeros = n.toString().length - 1;
  if (totalCeros < 6) return seisDigitos(Number(n));

  // Nivel exponencial: el mayor `nivel` tal que 6 × 2^nivel <= totalCeros.
  // Bucle en enteros (sin log2 flotante) para soportar números gigantes.
  let ceros = 6;
  let nivel = 0;
  while (ceros * 2 <= totalCeros) {
    ceros *= 2;
    nivel += 1;
  }

  const prefijo = generarPrefijoLatino(nivel + 1);
  const unidadBase = 10n ** BigInt(ceros);
  const cantidad = n / unidadBase;
  const residuo = n % unidadBase;

  // Si la lectura de la cantidad termina en "-illón/-illones", se une con
  // "de": "cinco millones de billones", no "cinco millones billones".
  const cantidadTexto = numeroAWords(cantidad);
  const nexo = /illone?s?$|illón$/.test(cantidadTexto) ? " de " : " ";
  const cabeza =
    cantidad === 1n
      ? `un ${prefijo}illón`
      : `${cantidadTexto}${nexo}${prefijo}illones`;

  return residuo > 0n ? `${cabeza} con ${traducir(residuo)}` : cabeza;
}

export default traducir;