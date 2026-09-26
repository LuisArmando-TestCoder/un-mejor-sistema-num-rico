import traducir, { generarPrefijoLatino, numeroAWords } from "./index.ts";

Deno.test("traducir: números por debajo de un millón", () => {
  if (traducir(0n) !== "cero") throw new Error("0n");
  if (traducir(1n) !== "uno") throw new Error("1n");
  if (traducir(10n) !== "diez") throw new Error("10n");
  if (traducir(15n) !== "quince") throw new Error("15n");
  if (traducir(21n) !== "veintiuno") throw new Error("21n");
  if (traducir(100n) !== "cien") throw new Error("100n");
  if (traducir(101n) !== "ciento uno") throw new Error("101n");
  if (traducir(999n) !== "novecientos noventa y nueve") throw new Error("999n");
  if (traducir(1000n) !== "mil") throw new Error("1000n");
  if (traducir(1001n) !== "mil uno") throw new Error("1001n");
  if (traducir(21000n) !== "veintiún mil") throw new Error("21000n");
  if (traducir(999999n) !== "novecientos noventa y nueve mil novecientos noventa y nueve") {
    throw new Error("999999n");
  }
});

Deno.test("traducir: unidades base del sistema exponencial", () => {
  if (traducir(1_000_000n) !== "un millón") throw new Error("10^6");
  if (traducir(10n ** 12n) !== "un billón") throw new Error("10^12");
  if (traducir(10n ** 24n) !== "un trillón") throw new Error("10^24");
  if (traducir(10n ** 48n) !== "un cuatrillón") throw new Error("10^48");
  if (traducir(10n ** 96n) !== "un quintillón") throw new Error("10^96");
});

Deno.test("traducir: plurals", () => {
  if (traducir(2_000_000n) !== "dos millones") throw new Error("dos millones");
  if (traducir(2n * 10n ** 24n) !== "dos trillones") throw new Error("dos trillones");
  if (traducir(3n * 10n ** 48n) !== "tres cuatrillones") throw new Error("tres cuatrillones");
});

Deno.test("traducir: residuos con ' con '", () => {
  const got = traducir(5_000_000_000_002_000_000n);
  if (got !== "cinco millones de billones con dos millones") {
    throw new Error(`got: ${got}`);
  }
});

Deno.test("traducir: número mixto grande", () => {
  const got = traducir(239847239048092384982903423023n);
  const expected =
    "doscientos treinta y nueve mil ochocientos cuarenta y siete trillones con doscientos treinta y nueve mil cuarenta y ocho millones noventa y dos mil trescientos ochenta y cuatro billones con novecientos ochenta y dos mil novecientos tres millones con cuatrocientos veintitrés mil veintitrés";
  if (got !== expected) throw new Error(`got: ${got}`);
});

Deno.test("traducir: acepta string", () => {
  if (traducir("1000000") !== "un millón") throw new Error("string 1e6");
  if (traducir("1" + "0".repeat(24)) !== "un trillón") throw new Error("string 1e24");
});

Deno.test("traducir: rechaza negativos", () => {
  let threw = false;
  try {
    traducir(-5n);
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("debía lanzar RangeError");
});

Deno.test("numeroAWords: escala larga estándar para leer cantidades", () => {
  if (numeroAWords(1_000_000n) !== "un millón") throw new Error("1e6");
  if (numeroAWords(239_048_092_384n) !==
    "doscientos treinta y nueve mil cuarenta y ocho millones noventa y dos mil trescientos ochenta y cuatro") {
    throw new Error("cantidad interna");
  }
});

Deno.test("generarPrefijoLatino: base y generativo", () => {
  if (generarPrefijoLatino(1) !== "m") throw new Error("1");
  if (generarPrefijoLatino(2) !== "b") throw new Error("2");
  if (generarPrefijoLatino(3) !== "tr") throw new Error("3");
  if (generarPrefijoLatino(4) !== "cuatr") throw new Error("4");
  if (generarPrefijoLatino(5) !== "quint") throw new Error("5");
  if (generarPrefijoLatino(10) !== "dec") throw new Error("10");
  if (generarPrefijoLatino(11) !== "undecim") throw new Error("11");
  if (generarPrefijoLatino(22) !== "duovigen") throw new Error("22");
  if (generarPrefijoLatino(100) !== "cent") throw new Error("100");
});

Deno.test("generarPrefijoLatino: rechaza órdenes inválidos", () => {
  let threw = false;
  try {
    generarPrefijoLatino(0);
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("orden 0 debía lanzar");
});

Deno.test("traducir: nivel generativo profundo (orden 11, 10^6144)", () => {
  const n = 10n ** BigInt(6 * 2 ** 10);
  if (traducir(n) !== "un undecimillón") {
    throw new Error(`got: ${traducir(n)}`);
  }
});