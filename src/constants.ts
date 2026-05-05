import type { KleurStijl } from './types';

export const KLEUR_STIJLEN: Record<string, KleurStijl> = {
  rood: {
    bg: 'bg-red-500',
    bgLight: 'bg-red-400',
    text: 'text-white',
    border: 'border-red-600',
    crossed: 'bg-red-700',
    die: 'bg-red-500 border-red-700',
  },
  geel: {
    bg: 'bg-yellow-400',
    bgLight: 'bg-yellow-300',
    text: 'text-yellow-900',
    border: 'border-yellow-500',
    crossed: 'bg-yellow-600',
    die: 'bg-yellow-400 border-yellow-600',
  },
  groen: {
    bg: 'bg-green-500',
    bgLight: 'bg-green-400',
    text: 'text-white',
    border: 'border-green-600',
    crossed: 'bg-green-700',
    die: 'bg-green-500 border-green-700',
  },
  blauw: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-400',
    text: 'text-white',
    border: 'border-blue-600',
    crossed: 'bg-blue-700',
    die: 'bg-blue-500 border-blue-700',
  },
  'rood-geel': {
    bg: 'bg-orange-400',
    bgLight: 'bg-orange-300',
    text: 'text-white',
    border: 'border-orange-500',
    crossed: 'bg-orange-600',
    die: 'bg-orange-400 border-orange-600',
  },
  'groen-blauw': {
    bg: 'bg-teal-400',
    bgLight: 'bg-teal-300',
    text: 'text-white',
    border: 'border-teal-500',
    crossed: 'bg-teal-600',
    die: 'bg-teal-400 border-teal-600',
  },
};

export const STANDAARD_KLEURSTIJL: KleurStijl = {
  bg: 'bg-gray-500',
  bgLight: 'bg-gray-400',
  text: 'text-white',
  border: 'border-gray-600',
  crossed: 'bg-gray-700',
  die: 'bg-gray-500 border-gray-700',
};

export function getKleurStijl(kleur: string): KleurStijl {
  return KLEUR_STIJLEN[kleur] ?? STANDAARD_KLEURSTIJL;
}

export const AI_NAMEN = ['Computer 1', 'Computer 2', 'Computer 3'];
