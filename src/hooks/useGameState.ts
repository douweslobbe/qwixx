import { useReducer } from 'react';
import type { SpelState, SpelActie } from '../types';
import { maakDobbelstenen, gooiAlleDobbelstenen } from '../engine/dice';
import {
  maakNieuweSpeler,
  pasZetToe,
  kanRijVergrendelen,
  vergrendelRij,
  geefStrafpunt,
  isSpelAfgelopen,
} from '../engine/gameLogic';
import { AI_NAMEN } from '../constants';
import { getVariant } from '../variants';
import { classicVariant } from '../variants/classic';

function maakInitieleState(): SpelState {
  return {
    status: 'setup',
    modus: 'solo',
    dobbelsteenModus: 'digitaal',
    variant: classicVariant,
    spelers: [],
    actieveSpelerIndex: 0,
    dobbelstenen: maakDobbelstenen(classicVariant),
    beurtStap: 'gooien',
    vergrendeldeRijen: [],
    stap1Gekozen: null,
    stap2Gekozen: null,
    laatsteAIZetten: {},
    aiRedeneringen: {},
    staatVoorStap2: null,
    vorigeState: null,
  };
}

function checkEnVergrendelRijen(state: SpelState): SpelState {
  let nieuweState = state;

  for (const rijConfig of state.variant.rijen) {
    if (nieuweState.vergrendeldeRijen.includes(rijConfig.id)) continue;

    for (const speler of nieuweState.spelers) {
      if (kanRijVergrendelen(speler.rijen[rijConfig.id], rijConfig)) {
        nieuweState = vergrendelRij(nieuweState, rijConfig.id);
        break;
      }
    }
  }

  return nieuweState;
}

function reducer(state: SpelState, actie: SpelActie): SpelState {
  switch (actie.type) {
    case 'START_SPEL': {
      const variant = getVariant(actie.variantId);
      const spelers = [maakNieuweSpeler('speler', 'Jij', false, variant)];
      if (actie.modus === 'solo') {
        for (let i = 0; i < actie.aantalAI; i++) {
          spelers.push(maakNieuweSpeler(`ai-${i}`, AI_NAMEN[i], true, variant));
        }
      }
      return {
        ...maakInitieleState(),
        status: 'actief',
        modus: actie.modus,
        dobbelsteenModus: actie.dobbelsteenModus,
        variant,
        spelers,
        dobbelstenen: maakDobbelstenen(variant),
        laatsteAIZetten: {},
        staatVoorStap2: null,
        vorigeState: null,
      };
    }

    case 'GOOI_DOBBELSTENEN': {
      return {
        ...state,
        dobbelstenen: gooiAlleDobbelstenen(state.dobbelstenen),
        beurtStap: 'stap1',
        stap1Gekozen: null,
        stap2Gekozen: null,
        laatsteAIZetten: {},
        aiRedeneringen: {},
        staatVoorStap2: null,
      };
    }

    case 'STEL_DOBBELSTENEN_IN': {
      const nieuweDobbelstenen = state.dobbelstenen.map((d) => ({
        ...d,
        waarde: actie.waarden[d.kleur] ?? d.waarde,
      }));
      return {
        ...state,
        dobbelstenen: nieuweDobbelstenen,
        beurtStap: 'stap1',
        stap1Gekozen: null,
        stap2Gekozen: null,
        laatsteAIZetten: {},
        aiRedeneringen: {},
        staatVoorStap2: null,
      };
    }

    case 'KIES_ZET': {
      const zet = actie.zet;
      // Valideer: stap1-zetten alleen in stap1, stap2 alleen in stap2
      if (zet.stap === 'stap1' && state.beurtStap !== 'stap1') return state;
      if (zet.stap === 'stap2' && state.beurtStap !== 'stap2') return state;

      if (zet.stap === 'stap1') {
        const speler = state.spelers[0];
        const bijgewerkt = pasZetToe(speler, zet);
        const nieuweSpelers = [...state.spelers];
        nieuweSpelers[0] = bijgewerkt;

        let nieuweState: SpelState = { ...state, spelers: nieuweSpelers, stap1Gekozen: zet };
        nieuweState = checkEnVergrendelRijen(nieuweState);
        return nieuweState;
      } else {
        const actieveIndex = state.actieveSpelerIndex;
        const speler = state.spelers[actieveIndex];
        const bijgewerkt = pasZetToe(speler, zet);
        const nieuweSpelers = [...state.spelers];
        nieuweSpelers[actieveIndex] = bijgewerkt;

        let nieuweState: SpelState = { ...state, spelers: nieuweSpelers, stap2Gekozen: zet };
        nieuweState = checkEnVergrendelRijen(nieuweState);
        return nieuweState;
      }
    }

    case 'PAS_STAP1': {
      // Sla snapshot op voor "terug naar stap1"
      const staatVoorStap2: SpelState = { ...state, staatVoorStap2: null, vorigeState: null };
      return { ...state, beurtStap: 'stap2', staatVoorStap2 };
    }

    case 'AI_STAP1_KLAAR': {
      const nieuweSpelers = [...state.spelers];
      const aiZetten: Record<string, import('../types').Zet> = {};
      const redeneringen: Record<string, { stap1?: import('../types').ZetEvaluatie | null }> = {};
      for (let i = 1; i < nieuweSpelers.length; i++) {
        const spelerId = nieuweSpelers[i].id;
        const aiZet = actie.zetten[spelerId];
        if (aiZet) {
          nieuweSpelers[i] = pasZetToe(nieuweSpelers[i], aiZet);
          aiZetten[spelerId] = aiZet;
        }
        if (actie.evaluaties) {
          redeneringen[spelerId] = { stap1: actie.evaluaties[spelerId] ?? null };
        }
      }
      // Sla snapshot op voor "terug naar stap1"
      const staatVoorStap2: SpelState = { ...state, staatVoorStap2: null, vorigeState: null };
      let nieuweState: SpelState = {
        ...state,
        spelers: nieuweSpelers,
        beurtStap: 'stap2',
        laatsteAIZetten: aiZetten,
        aiRedeneringen: redeneringen,
        staatVoorStap2,
      };
      nieuweState = checkEnVergrendelRijen(nieuweState);
      return nieuweState;
    }

    case 'AI_STAP2_KLAAR': {
      const { spelerId, zet, evaluatie } = actie;
      let nieuweSpelers = [...state.spelers];
      const spelerIndex = nieuweSpelers.findIndex(s => s.id === spelerId);
      if (zet && spelerIndex >= 0) {
        nieuweSpelers[spelerIndex] = pasZetToe(nieuweSpelers[spelerIndex], zet);
      }
      const nieuweRedeneringen = { ...state.aiRedeneringen };
      nieuweRedeneringen[spelerId] = {
        ...nieuweRedeneringen[spelerId],
        stap2: evaluatie,
      };
      let nieuweState: SpelState = { ...state, spelers: nieuweSpelers, aiRedeneringen: nieuweRedeneringen };
      if (zet) {
        nieuweState.stap2Gekozen = zet;
        nieuweState = checkEnVergrendelRijen(nieuweState);
      }
      return nieuweState;
    }

    case 'PAS_STAP2': {
      const actieveIndex = state.actieveSpelerIndex;
      const actieveSpeler = state.spelers[actieveIndex];
      const heeftStap1Gedaan = state.stap1Gekozen !== null;
      const heeftStap2Gedaan = state.stap2Gekozen !== null;

      let nieuweSpelers = [...state.spelers];
      if (!heeftStap1Gedaan && !heeftStap2Gedaan) {
        nieuweSpelers[actieveIndex] = geefStrafpunt(actieveSpeler);
      }

      // Bewaar state voor undo (zonder circulaire referentie)
      const vorigeState = { ...state, vorigeState: null, staatVoorStap2: null };
      let nieuweState: SpelState = {
        ...state,
        spelers: nieuweSpelers,
        beurtStap: 'klaar',
        staatVoorStap2: null,
        vorigeState,
      };

      if (isSpelAfgelopen(nieuweState)) {
        return { ...nieuweState, status: 'afgelopen' };
      }
      return nieuweState;
    }

    case 'TERUG_NAAR_STAP1': {
      if (!state.staatVoorStap2) return state;
      // Herstel de snapshot van voor stap2 (inclusief eventueel gemaakte stap1-keuze)
      return { ...state.staatVoorStap2, staatVoorStap2: null };
    }

    case 'VOLGENDE_BEURT': {
      const volgendeIndex = (state.actieveSpelerIndex + 1) % state.spelers.length;
      return {
        ...state,
        actieveSpelerIndex: volgendeIndex,
        beurtStap: 'gooien',
        stap1Gekozen: null,
        stap2Gekozen: null,
        laatsteAIZetten: {},
        aiRedeneringen: {},
        staatVoorStap2: null,
      };
    }

    case 'UNDO': {
      if (state.vorigeState) {
        return { ...state.vorigeState, vorigeState: null };
      }
      return state;
    }

    case 'RESET_SPEL': {
      return maakInitieleState();
    }

    default:
      return state;
  }
}

export function useGameState() {
  return useReducer(reducer, undefined, maakInitieleState);
}
