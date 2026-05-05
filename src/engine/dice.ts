import type { Dobbelsteen, VariantConfig } from '../types';

export function gooiDobbelsteen(zijden: number): number {
  return Math.floor(Math.random() * zijden) + 1;
}

export function maakDobbelstenen(variant: VariantConfig): Dobbelsteen[] {
  return variant.dobbelstenen.map((config) => ({
    kleur: config.kleur,
    waarde: 1,
    actief: true,
    zijden: config.zijden,
  }));
}

export function gooiAlleDobbelstenen(dobbelstenen: Dobbelsteen[]): Dobbelsteen[] {
  return dobbelstenen.map((d) =>
    d.actief ? { ...d, waarde: gooiDobbelsteen(d.zijden) } : d
  );
}
