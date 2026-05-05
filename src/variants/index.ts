import type { VariantConfig, VariantId } from '../types';
import { classicVariant } from './classic';
import { doubleVariant } from './double';
import { longoVariant } from './longo';
import { mixxAVariant } from './mixx-a';
import { mixxBVariant } from './mixx-b';
import { bigPointsVariant } from './big-points';
import { bonusVariant } from './bonus';
import { connectedStepVariant } from './connected-step';
import { connectedChainsVariant } from './connected-chains';

export const VARIANT_REGISTRY: Record<VariantId, VariantConfig> = {
  'classic': classicVariant,
  'double': doubleVariant,
  'longo': longoVariant,
  'mixx-a': mixxAVariant,
  'mixx-b': mixxBVariant,
  'big-points': bigPointsVariant,
  'bonus': bonusVariant,
  'connected-step': connectedStepVariant,
  'connected-chains': connectedChainsVariant,
};

export const VARIANT_LIJST: VariantConfig[] = [
  classicVariant,
  doubleVariant,
  longoVariant,
  mixxAVariant,
  mixxBVariant,
  bigPointsVariant,
  bonusVariant,
  connectedStepVariant,
  connectedChainsVariant,
];

export function getVariant(id: VariantId): VariantConfig {
  return VARIANT_REGISTRY[id] ?? classicVariant;
}
