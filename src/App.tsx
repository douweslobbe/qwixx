import { useEffect, useCallback, useState, useRef } from 'react';
import type { Zet, ZetEvaluatie } from './types';
import { useGameState } from './hooks/useGameState';
import { useAdvisory } from './hooks/useAdvisory';
import { vindLegaleZetten, berekenWitSom } from './engine/gameLogic';
import { beslisAIZet, evalueerZetMetReden } from './engine/ai';
import { GameSetup } from './components/GameSetup';
import { ScoreCard } from './components/ScoreCard';
import { DiceArea } from './components/DiceArea';
import { GameControls } from './components/GameControls';
import { ManualDiceInput } from './components/ManualDiceInput';
import { AdvisoryPanel } from './components/AdvisoryPanel';
import { GameOverScreen } from './components/GameOverScreen';
import { AIReasoningPanel } from './components/AIReasoningPanel';
import { RuleHighlights } from './components/RuleHighlights';

function App() {
  const [state, dispatch] = useGameState();
  const [rolling, setRolling] = useState(false);
  const [simuleerNietAanBeurt, setSimuleerNietAanBeurt] = useState(false);
  const aiBezig = useRef(false);

  const actieveSpeler = state.spelers[state.actieveSpelerIndex];
  const menselijkeSpeler = state.spelers[0];
  const isActieveSpeler = state.actieveSpelerIndex === 0 && !(state.modus === 'advies' && simuleerNietAanBeurt);
  const echteDobbelstenen = state.dobbelsteenModus === 'echt';

  const adviezen = useAdvisory(state, isActieveSpeler);

  // Legale zetten voor de menselijke speler
  const legaleZettenStap1 = state.beurtStap === 'stap1' && menselijkeSpeler && state.stap1Gekozen === null
    ? vindLegaleZetten(menselijkeSpeler, 'stap1', state.dobbelstenen, state.vergrendeldeRijen, state.variant)
    : [];

  const legaleZettenStap2 = state.beurtStap === 'stap2' && menselijkeSpeler && isActieveSpeler && state.stap2Gekozen === null
    ? vindLegaleZetten(menselijkeSpeler, 'stap2', state.dobbelstenen, state.vergrendeldeRijen, state.variant)
    : [];

  const legaleZetten = state.beurtStap === 'stap1' ? legaleZettenStap1 : legaleZettenStap2;

  // Gooi dobbelstenen met animatie
  const handleGooi = useCallback(() => {
    setRolling(true);
    setTimeout(() => {
      dispatch({ type: 'GOOI_DOBBELSTENEN' });
      setRolling(false);
    }, 400);
  }, [dispatch]);

  // Handmatige dobbelsteeninvoer (advies-modus)
  const handleManualDice = useCallback((waarden: Record<string, number>) => {
    dispatch({ type: 'STEL_DOBBELSTENEN_IN', waarden });
  }, [dispatch]);

  // Kies een zet
  const handleKiesZet = useCallback((zet: Zet) => {
    dispatch({ type: 'KIES_ZET', zet });
  }, [dispatch]);

  // Kies advies-zet
  const handleKiesAdvies = useCallback((advies: ZetEvaluatie) => {
    dispatch({ type: 'KIES_ZET', zet: advies });
  }, [dispatch]);

  // Bevestig/pas stap 1 (ga naar stap 2, AI speelt stap1 mee)
  const handleEindeStap1 = useCallback(() => {
    if (state.modus === 'solo') {
      const zetten: Record<string, Zet | null> = {};
      const evaluaties: Record<string, ZetEvaluatie | null> = {};
      for (let i = 1; i < state.spelers.length; i++) {
        const speler = state.spelers[i];
        if (!speler.isAI) continue;
        const zet = beslisAIZet(speler, 'stap1', state.dobbelstenen, state.vergrendeldeRijen, state.variant);
        if (zet) {
          zetten[speler.id] = zet;
          evaluaties[speler.id] = evalueerZetMetReden(speler, zet, state.variant);
        } else {
          evaluaties[speler.id] = null;
        }
      }
      dispatch({ type: 'AI_STAP1_KLAAR', zetten, evaluaties });
    } else {
      dispatch({ type: 'PAS_STAP1' });
    }
  }, [dispatch, state]);

  // Bevestig/pas stap 2
  const handleEindeStap2 = useCallback(() => {
    dispatch({ type: 'PAS_STAP2' });
  }, [dispatch]);

  // Terug naar stap 1 (herstel snapshot van voor stap2)
  const handleTerugNaarStap1 = useCallback(() => {
    dispatch({ type: 'TERUG_NAAR_STAP1' });
  }, [dispatch]);

  // Volgende beurt
  const handleVolgendeBeurt = useCallback(() => {
    dispatch({ type: 'VOLGENDE_BEURT' });
  }, [dispatch]);

  // AI actieve speler beurt automatisch spelen
  useEffect(() => {
    if (state.status !== 'actief') return;
    if (!actieveSpeler?.isAI) return;
    if (aiBezig.current) return;

    if (state.beurtStap === 'gooien') {
      // Bij echte dobbelstenen gooit de speler zelf - AI wacht op invoer
      if (echteDobbelstenen) return;
      aiBezig.current = true;
      const timeout = setTimeout(() => {
        handleGooi();
        aiBezig.current = false;
      }, 1000);
      return () => { clearTimeout(timeout); aiBezig.current = false; };
    }

    // Stap1: de menselijke speler mag ook kiezen via de UI.
    if (state.beurtStap === 'stap1') {
      return;
    }

    if (state.beurtStap === 'stap2') {
      aiBezig.current = true;
      const timeout = setTimeout(() => {
        const zet = beslisAIZet(actieveSpeler, 'stap2', state.dobbelstenen, state.vergrendeldeRijen, state.variant);
        const evaluatie = zet ? evalueerZetMetReden(actieveSpeler, zet, state.variant) : null;
        dispatch({ type: 'AI_STAP2_KLAAR', spelerId: actieveSpeler.id, zet, evaluatie });
        setTimeout(() => {
          dispatch({ type: 'PAS_STAP2' });
          aiBezig.current = false;
        }, 800);
      }, 1000);
      return () => { clearTimeout(timeout); aiBezig.current = false; };
    }

    if (state.beurtStap === 'klaar') {
      aiBezig.current = true;
      const timeout = setTimeout(() => {
        dispatch({ type: 'VOLGENDE_BEURT' });
        aiBezig.current = false;
      }, 1000);
      return () => { clearTimeout(timeout); aiBezig.current = false; };
    }
  }, [state.status, state.beurtStap, state.actieveSpelerIndex, actieveSpeler, state.spelers, state.dobbelstenen, state.vergrendeldeRijen, state.variant, echteDobbelstenen, dispatch, handleGooi]);


  if (state.status === 'setup') {
    return (
      <GameSetup
        onStart={(modus, aantalAI, variantId, dobbelsteenModus) => dispatch({ type: 'START_SPEL', modus, aantalAI, variantId, dobbelsteenModus })}
      />
    );
  }

  const witSom = state.beurtStap !== 'gooien' ? berekenWitSom(state.dobbelstenen) : null;

  return (
    <div className="min-h-screen p-3 sm:p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-gradient tracking-tight" style={{ fontFamily: "'Nunito', sans-serif" }}>QWIXX</h1>
          <div className="flex items-center gap-3">
            {state.vorigeState && (
              <button
                onClick={() => dispatch({ type: 'UNDO' })}
                className="text-gray-500 hover:text-yellow-400 text-sm transition-colors"
                title="Laatste beurt ongedaan maken"
              >
                ↩ Undo
              </button>
            )}
            {state.modus === 'advies' && (
              <button
                onClick={() => setSimuleerNietAanBeurt(!simuleerNietAanBeurt)}
                className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                  simuleerNietAanBeurt
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                    : 'bg-green-500/20 text-green-400 border border-green-500/50'
                }`}
              >
                {simuleerNietAanBeurt ? 'Niet aan de beurt' : 'Aan de beurt'}
              </button>
            )}
            <span className="text-gray-400 text-sm">
              Beurt: <span className="text-white font-medium">{actieveSpeler?.naam}</span>
            </span>
            <button
              onClick={() => dispatch({ type: 'RESET_SPEL' })}
              className="text-gray-500 hover:text-red-400 text-sm transition-colors"
            >
              ✕ Stop
            </button>
          </div>
        </div>

        {/* Dobbelstenen */}
        <div className="dice-panel rounded-xl p-4">
          {state.beurtStap === 'gooien' && echteDobbelstenen ? (
            <ManualDiceInput
              dobbelsteenConfigs={state.variant.dobbelstenen}
              onBevestig={handleManualDice}
            />
          ) : (
            <DiceArea
              dobbelstenen={state.dobbelstenen}
              rolling={rolling}
              witSom={witSom}
            />
          )}
        </div>

        {/* Controls - verberg gooi-knop bij echte dobbelstenen (ManualDiceInput heeft eigen bevestig) */}
        {!(echteDobbelstenen && state.beurtStap === 'gooien') && (!actieveSpeler?.isAI || state.beurtStap === 'stap1') && (
          <GameControls
            beurtStap={state.beurtStap}
            isActieveSpeler={isActieveSpeler}
            heeftStap1Gekozen={state.stap1Gekozen !== null}
            heeftStap2Gekozen={state.stap2Gekozen !== null}
            strafpunten={menselijkeSpeler?.strafpunten ?? 0}
            maxStrafpunten={state.variant.maxStrafpunten}
            kanTerugNaarStap1={state.staatVoorStap2 !== null && isActieveSpeler}
            onGooi={handleGooi}
            onBevestigStap1={handleEindeStap1}
            onPasStap1={handleEindeStap1}
            onBevestigStap2={handleEindeStap2}
            onPasStap2={handleEindeStap2}
            onTerugNaarStap1={handleTerugNaarStap1}
            onVolgendeBeurt={handleVolgendeBeurt}
          />
        )}

        {/* Advies-paneel */}
        {state.modus === 'advies' && state.beurtStap !== 'gooien' && state.beurtStap !== 'klaar' && (
          <AdvisoryPanel
            adviezen={adviezen}
            variant={state.variant}
            onKies={handleKiesAdvies}
            onPas={state.beurtStap === 'stap1' ? handleEindeStap1 : handleEindeStap2}
          />
        )}

        {/* AI bezig indicator */}
        {actieveSpeler?.isAI && state.beurtStap !== 'stap1' && !(echteDobbelstenen && state.beurtStap === 'gooien') && (
          <div className="text-center text-gray-400 text-sm py-2">
            <span className="inline-block animate-pulse">🤖 {actieveSpeler.naam} denkt na...</span>
          </div>
        )}

        {/* AI Redeneringen */}
        {state.modus === 'solo' && Object.keys(state.aiRedeneringen).length > 0 && (
          <AIReasoningPanel
            aiRedeneringen={state.aiRedeneringen}
            spelers={state.spelers}
            variant={state.variant}
          />
        )}

        {/* Scorekaarten */}
        <div className="space-y-3">
          {menselijkeSpeler && (
            <ScoreCard
              speler={menselijkeSpeler}
              variant={state.variant}
              legaleZetten={legaleZetten}
              onKiesZet={handleKiesZet}
              interactief={state.beurtStap === 'stap1' || (state.beurtStap === 'stap2' && isActieveSpeler)}
              isActief={isActieveSpeler}
            />
          )}

          {state.spelers.filter((s) => s.isAI).map((speler) => (
            <ScoreCard
              key={speler.id}
              speler={speler}
              variant={state.variant}
              legaleZetten={[]}
              onKiesZet={() => {}}
              interactief={false}
              isActief={state.spelers[state.actieveSpelerIndex]?.id === speler.id}
              compact
              laatsteZet={state.laatsteAIZetten[speler.id] ?? null}
            />
          ))}
        </div>

        {/* Spelregels */}
        <RuleHighlights variant={state.variant} />
      </div>

      {/* Game Over */}
      {state.status === 'afgelopen' && (
        <GameOverScreen
          spelers={state.spelers}
          variant={state.variant}
          onNieuwSpel={() => dispatch({ type: 'RESET_SPEL' })}
        />
      )}
    </div>
  );
}

export default App;
