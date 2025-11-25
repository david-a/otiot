<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Progress, Word } from '$lib/types';
  import { EXTRA_LETTERS_BY_LEVEL, calculateScore, getWordStructure, getRandomExtraLetters, normalizeHebrewText, splitLongVowel } from '$lib/game/logic';
  import { allWords, getWordsForLevel } from '$lib/data/words';
  import { playAudioForText, playAudioFromUrl } from '$lib/audio';
  import GameHeader from '$lib/components/GameHeader.svelte';
  import LetterSlot from '$lib/components/LetterSlot.svelte';
  import NikudSlot from '$lib/components/NikudSlot.svelte';
  import LetterTile from '$lib/components/LetterTile.svelte';
  import WordImage from '$lib/components/WordImage.svelte';
  import CelebrationModal from '$lib/components/CelebrationModal.svelte';
  import { saveProgress } from '$lib/storage/progress';

  const HEBREW_LETTERS = [
    'א',
    'ב',
    'ג',
    'ד',
    'ה',
    'ו',
    'ז',
    'ח',
    'ט',
    'י',
    'כ',
    'ל',
    'מ',
    'נ',
    'ס',
    'ע',
    'פ',
    'צ',
    'ק',
    'ר',
    'ש',
    'ת'
  ];

  export let playerName: string;
  export let playerId: string;
  export let initialProgress: Progress | null = null;

  const dispatch = createEventDispatcher<{ progressUpdate: Progress }>();

  let currentLevel = initialProgress?.currentLevel ?? 1;
  let totalScore = initialProgress?.totalScore ?? 0;
  let completedWordIds: string[] = initialProgress?.completedWordIds ?? [];
  let currentWord: Word | null = null;
  let completedInLevel = 0;
  const wordsRequiredPerLevel = 5;
  let isLoadingWord = false;

  // Word-specific state
  let letterSlots: (string | null)[] = [];
  let nikudSlots: (string | null)[] = [];
  let letterTiles: string[] = [];
  let nikudTiles: string[] = [];
  let correctLetters: string[] = [];
  let correctNikud: (string | null)[] = [];
  let isCorrect: boolean[] = [];
  let isError: boolean[] = [];
  let hasAnimated: boolean[] = [];
  let isDragOver: boolean[] = [];
  let isDragOverNikud: boolean[] = [];
  let isDragging: boolean[] = [];
  let isDraggingNikud: boolean[] = [];
  let separateNikud = false;
  let isPlayingSound = false;
  let showCelebration = false;
  let showWordSuccess = false;
  let wordSuccessScore = 0;
  let draggedIndex: number | null = null;

  const updateProgress = (partial: Partial<Progress>) => {
    const progress: Progress = {
      playerId,
      playerName,
      currentLevel,
      completedWordIds,
      totalScore,
      lastPlayedAt: new Date().toISOString(),
      currentWordId: currentWord?.id,
      ...partial
    };
    saveProgress(progress);
    dispatch('progressUpdate', progress);
  };

  const recalcCompletedInLevel = () => {
    const wordsInLevel = getWordsForLevel(currentLevel);
    completedInLevel = completedWordIds.filter((id) => wordsInLevel.some((w) => w.id === id)).length;
  };

  const pickNextWord = (excludeId?: string): Word | null => {
    const pool = getWordsForLevel(currentLevel);
    const available = pool.filter(
      (w) => !completedWordIds.includes(w.id) && w.id !== excludeId && w.id !== currentWord?.id
    );
    if (!available.length) return null;
    return available[Math.floor(Math.random() * available.length)];
  };

  const initialiseWord = () => {
    if (!currentWord) return;

    const { letters, nikud } = getWordStructure(currentWord.nikud);
    correctLetters = letters;
    correctNikud = nikud;

    separateNikud = currentLevel >= 3;

    const extraCount = EXTRA_LETTERS_BY_LEVEL[currentLevel] ?? 0;
    const extraLetters =
      extraCount > 0 ? getRandomExtraLetters(HEBREW_LETTERS, letters, extraCount) : [];

    let allNikudTiles: string[] = [];
    let allLetterTiles: string[] = [];

    if (separateNikud) {
      const uniqueNikud = Array.from(new Set(nikud.filter((n) => n !== null) as string[]));
      const extraNikudCandidates = ['\u05B7', '\u05B8', '\u05B4', '\u05B5', '\u05B6'].filter(
        (n) => !uniqueNikud.includes(n)
      );
      allNikudTiles = shuffle([
        ...uniqueNikud,
        ...extraNikudCandidates.slice(0, extraCount)
      ]);
      allLetterTiles = shuffle([...letters, ...extraLetters]);
    } else {
      const lettersWithNikud = letters.map((letter, idx) => letter + (nikud[idx] || ''));
      const extraLettersWithNikud = extraLetters.map(
        (letter) => letter + (nikud[Math.floor(Math.random() * nikud.length)] || '')
      );
      allLetterTiles = shuffle([...lettersWithNikud, ...extraLettersWithNikud]);
    }

    letterSlots = new Array(letters.length).fill(null);
    nikudSlots = separateNikud ? new Array(nikud.length).fill(null) : [];
    letterTiles = allLetterTiles;
    nikudTiles = allNikudTiles;
    isCorrect = new Array(letters.length).fill(false);
    isError = new Array(letters.length).fill(false);
    hasAnimated = new Array(letters.length).fill(false);
    isDragOver = new Array(letters.length).fill(false);
    isDragging = new Array(allLetterTiles.length).fill(false);
    isDraggingNikud = new Array(allNikudTiles.length).fill(false);
  };

  const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const loadNextWord = (excludeId?: string) => {
    isLoadingWord = true;
    const next = pickNextWord(excludeId);
    if (!next) {
      // Level complete
      isLoadingWord = false;
      showCelebration = true;
      return;
    }
    currentWord = next;
    isLoadingWord = false;
    initialiseWord();
    updateProgress({ currentWordId: next.id });
  };

  const completeWord = async () => {
    if (!currentWord) return;
    const score = calculateScore(currentLevel, letterSlots.length);
    totalScore += score;
    completedWordIds = [...completedWordIds, currentWord.id];
    recalcCompletedInLevel();

    wordSuccessScore = score;
    showWordSuccess = true;
    setTimeout(() => {
      showWordSuccess = false;
    }, 2000);

    // Play word audio
    if (currentWord.soundUrl) {
      await playAudioFromUrl(currentWord.soundUrl);
    } else {
      await playAudioForText(currentWord.nikud);
    }

    // Wait for word audio to finish, then play celebration message
    await playAudioForText('כל הכבוד!', false);

    updateProgress({
      totalScore,
      completedWordIds,
      currentWordId: undefined
    });

    if (completedInLevel >= wordsRequiredPerLevel) {
      // Wait for previous message to finish, then play level up message
      await playAudioForText('עלית רמה! כל הכבוד!', false);
      showCelebration = true;
    } else {
      setTimeout(() => loadNextWord(currentWord?.id), 1200);
    }
  };

  const advanceLevel = () => {
    currentLevel += 1;
    completedInLevel = 0;
    currentWord = null;
    showCelebration = false;
    loadNextWord();
  };

  const checkWordComplete = (letters: (string | null)[], nikud: (string | null)[]) => {
    if (!currentWord) return;

    if (separateNikud) {
      const lettersComplete = letters.every((slot, idx) => slot === correctLetters[idx]);
      const nikudComplete = nikud.every((slot, idx) => slot === correctNikud[idx]);
      if (lettersComplete && nikudComplete) {
        void completeWord();
      }
    } else {
      const combinedComplete = letters.every((slot, idx) => {
        const correctCombined = correctLetters[idx] + (correctNikud[idx] || '');
        return slot === correctCombined;
      });
      if (combinedComplete) {
        void completeWord();
      }
    }
  };

  const playLetterSound = async (letter: string, isNikud = false) => {
    if (isNikud && separateNikud) {
      await playAudioForText(letter);
      return;
    }

    const longVowel = splitLongVowel(letter);
    if (longVowel.isLongVowel) {
      const baseLetterOnly = longVowel.baseLetter.replace(/[\u05B0-\u05BF\u05C0-\u05C7]/g, '');
      await playAudioForText(baseLetterOnly);
      await new Promise((r) => setTimeout(r, 300));
      await playAudioForText(letter);
      return;
    }

    const letterOnly = letter.replace(/[\u05B0-\u05BF\u05C0-\u05C7]/g, '');
    const hasNikud = letter.length > letterOnly.length;

    await playAudioForText(letterOnly);
    if (hasNikud) {
      await new Promise((r) => setTimeout(r, 300));
      await playAudioForText(letter);
    } else {
      await new Promise((r) => setTimeout(r, 300));
      await playAudioForText(letterOnly + '\u05B0');
    }
  };

  const handleTileDragStart = (payload: { index: number; letter: string; event: DragEvent }, isNikud = false) => {
    draggedIndex = payload.index;
    const { event, letter } = payload;
    if (isNikud && separateNikud) {
      isDraggingNikud = isDraggingNikud.map((_, i) => i === payload.index);
      event.dataTransfer?.setData('text/plain', `nikud:${letter}`);
    } else {
      isDragging = isDragging.map((_, i) => i === payload.index);
      event.dataTransfer?.setData(
        'text/plain',
        separateNikud ? `letter:${letter}` : `combined:${letter}`
      );
    }
    event.dataTransfer!.effectAllowed = 'move';
    void playLetterSound(letter, isNikud);
  };

  const handleTileDragEnd = (isNikud = false) => {
    draggedIndex = null;
    if (isNikud) {
      isDraggingNikud = isDraggingNikud.map(() => false);
    } else {
      isDragging = isDragging.map(() => false);
    }
    isDragOver = isDragOver.map(() => false);
    isDragOverNikud = isDragOverNikud.map(() => false);
  };

  const handleLetterDragOver = (event: DragEvent, slotIndex: number) => {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    isDragOver = isDragOver.map((_, i) => i === slotIndex);
  };

  const handleLetterDragLeave = (slotIndex: number) => {
    isDragOver = isDragOver.map((v, i) => (i === slotIndex ? false : v));
  };

  const handleDrop = (event: DragEvent, slotIndex: number, isNikudSlot = false) => {
    event.preventDefault();
    isDragOver = isDragOver.map((v, i) => (i === slotIndex ? false : v));

    if (!currentWord) return;
    const data = event.dataTransfer?.getData('text/plain') ?? '';
    const [type, value] = data.split(':');

    if (type === 'combined' && !separateNikud) {
      const correctCombined = correctLetters[slotIndex] + (correctNikud[slotIndex] || '');
      const isCorrectPlacement =
        normalizeHebrewText(value) === normalizeHebrewText(correctCombined);

      if (isCorrectPlacement) {
        letterSlots = letterSlots.map((slot, i) => (i === slotIndex ? value : slot));
        isCorrect = isCorrect.map((v, i) => (i === slotIndex ? true : v));
        hasAnimated = hasAnimated.map((v, i) => (i === slotIndex ? true : v));
        if (draggedIndex !== null) {
          letterTiles = letterTiles.filter((_, i) => i !== draggedIndex);
          draggedIndex = null;
        }
        setTimeout(() => {
          checkWordComplete(
            letterSlots.map((slot, i) => (i === slotIndex ? value : slot)),
            []
          );
        }, 80);
      } else {
        isError = isError.map((v, i) => (i === slotIndex ? true : v));
        setTimeout(() => {
          isError = isError.map((v, i) => (i === slotIndex ? false : v));
        }, 400);
      }
      return;
    }

    if (isNikudSlot && type === 'nikud' && separateNikud) {
      const correctNikudMark = correctNikud[slotIndex];
      const isCorrectPlacement = value === correctNikudMark;

      if (isCorrectPlacement) {
        nikudSlots = nikudSlots.map((slot, i) => (i === slotIndex ? value : slot));
        if (draggedIndex !== null) {
          nikudTiles = nikudTiles.filter((_, i) => i !== draggedIndex);
          draggedIndex = null;
        }
        setTimeout(() => {
          const updated = nikudSlots.map((slot, i) => (i === slotIndex ? value : slot));
          checkWordComplete(letterSlots, updated);
        }, 80);
      } else {
        isError = isError.map((v, i) => (i === slotIndex ? true : v));
        setTimeout(() => {
          isError = isError.map((v, i) => (i === slotIndex ? false : v));
        }, 400);
      }
    } else if (!isNikudSlot && type === 'letter') {
      const correctLetter = correctLetters[slotIndex];
      const isCorrectPlacement = value === correctLetter;

      if (isCorrectPlacement) {
        letterSlots = letterSlots.map((slot, i) => (i === slotIndex ? value : slot));
        isCorrect = isCorrect.map((v, i) => (i === slotIndex ? true : v));
        hasAnimated = hasAnimated.map((v, i) => (i === slotIndex ? true : v));
        if (draggedIndex !== null) {
          letterTiles = letterTiles.filter((_, i) => i !== draggedIndex);
          draggedIndex = null;
        }
        setTimeout(() => {
          const updated = letterSlots.map((slot, i) => (i === slotIndex ? value : slot));
          checkWordComplete(updated, nikudSlots);
        }, 80);
      } else {
        isError = isError.map((v, i) => (i === slotIndex ? true : v));
        setTimeout(() => {
          isError = isError.map((v, i) => (i === slotIndex ? false : v));
        }, 400);
      }
    }
  };

  const changeWord = () => {
    if (!currentWord) return;
    loadNextWord(currentWord.id);
  };

  const handlePlayWordSound = async () => {
    if (!currentWord || isPlayingSound) return;
    isPlayingSound = true;
    try {
      if (currentWord.soundUrl) {
        await playAudioFromUrl(currentWord.soundUrl);
      } else {
        await playAudioForText(currentWord.nikud);
      }
    } finally {
      isPlayingSound = false;
    }
  };

  const hasAnyWords = allWords.length > 0;

  onMount(() => {
    if (!hasAnyWords) return;
    // Attempt to restore current word from progress
    if (initialProgress?.currentWordId) {
      const restored = allWords.find((w) => w.id === initialProgress.currentWordId);
      if (restored && restored.level === currentLevel) {
        currentWord = restored;
        recalcCompletedInLevel();
        initialiseWord();
        return;
      }
    }
    loadNextWord();
  });
</script>

{#if !hasAnyWords}
  <div class="empty-state">
    <div class="card">
      <div class="title">עוד לא הוגדרו מילים</div>
      <div class="body">
        פתח /י את הממשק ב
        <code>/admin</code>
        והוסיפי מילים חדשות לאוסף.
      </div>
    </div>
  </div>
{:else if !currentWord}
  <div class="loading">
    {#if isLoadingWord}
      טוען מילה חדשה...
    {:else}
      טוען...
    {/if}
  </div>
{:else}
  <div class="game-root">
    <GameHeader
      level={currentLevel}
      score={totalScore}
      completedInLevel={completedInLevel}
      totalInLevel={wordsRequiredPerLevel}
    />

    <div class="top-row">
      <WordImage word={currentWord} isPlaying={isPlayingSound} />
      <button class="icon-btn" type="button" on:click={changeWord} title="החלף מילה">
        ↻
      </button>
    </div>

    {#if showWordSuccess}
      <div class="success-float">
        <div class="success-card">
          <div class="success-title">כל הכבוד!</div>
          <div class="success-score">+{wordSuccessScore} נקודות</div>
        </div>
      </div>
    {/if}

    <div class="slots-wrap">
      <div class="letters">
        {#each letterSlots as slot, index}
          <div class="letter-column">
            <LetterSlot
              letter={slot}
              isCorrect={isCorrect[index]}
              isError={isError[index]}
              isDragOver={isDragOver[index]}
              hasAnimated={hasAnimated[index]}
              onDrop={(event) => handleDrop(event, index, false)}
              onDragOver={(event) => handleLetterDragOver(event, index)}
              onDragLeave={() => handleLetterDragLeave(index)}
            />

            {#if separateNikud}
              <NikudSlot
                nikud={nikudSlots[index]}
                isCorrect={isCorrect[index]}
                isError={isError[index]}
                isDragOver={isDragOverNikud[index]}
                onDrop={(event) => handleDrop(event, index, true)}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer!.dropEffect = 'move';
                  isDragOverNikud = isDragOverNikud.map((v, i) => (i === index ? true : v));
                }}
                onDragLeave={() => {
                  isDragOverNikud = isDragOverNikud.map((v, i) => (i === index ? false : v));
                }}
              />
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <section class="tiles-section">
      <h2 class="tiles-title">אותיות</h2>
      <div class="tiles-grid">
        {#each letterTiles as letter, index}
          <LetterTile
            {letter}
            {index}
            isDragging={isDragging[index]}
            colorIndex={index}
            on:dragstart={(event) => handleTileDragStart(event.detail, false)}
            on:dragend={() => handleTileDragEnd(false)}
            on:click={() => void playLetterSound(letter, false)}
          />
        {/each}
      </div>
    </section>

    {#if separateNikud && nikudTiles.length > 0}
      <section class="tiles-section">
        <h2 class="tiles-title">ניקוד</h2>
        <div class="tiles-grid">
          {#each nikudTiles as mark, index}
            <LetterTile
              letter={mark}
              {index}
              isDragging={isDraggingNikud[index]}
              colorIndex={index + 100}
              on:dragstart={(event) => handleTileDragStart(event.detail, true)}
              on:dragend={() => handleTileDragEnd(true)}
              on:click={() => void playLetterSound(mark, true)}
            />
          {/each}
        </div>
      </section>
    {/if}

    <CelebrationModal open={showCelebration} level={currentLevel} on:next={advanceLevel} />
  </div>
{/if}

<style>
  .game-root {
    width: 100%;
    max-width: 72rem;
    margin-inline: auto;
    padding: 2rem 1.5rem 3rem;
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    font-size: 1.6rem;
  }

  .top-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
  }

  .icon-btn {
    width: 3rem;
    height: 3rem;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.45);
    background: rgba(15, 23, 42, 0.9);
    color: #e5e7eb;
    font-size: 1.4rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 26px rgba(15, 23, 42, 0.85);
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease,
      border-color 0.15s ease;
  }

  .icon-btn:hover {
    transform: translateY(-1px) rotate(-10deg);
    border-color: #38bdf8;
    box-shadow: 0 16px 36px rgba(8, 47, 73, 0.9);
  }

  .slots-wrap {
    display: flex;
    justify-content: center;
  }

  .letters {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .letter-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .tiles-section {
    margin-top: 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
  }

  .tiles-title {
    font-size: 1.1rem;
    color: #e5e7eb;
  }

  .tiles-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  .success-float {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 30;
  }

  .success-card {
    background: rgba(234, 179, 8, 0.96);
    color: #0f172a;
    padding: 1.25rem 2rem;
    border-radius: 999px;
    box-shadow: 0 24px 80px rgba(161, 98, 7, 0.9);
    animation: bounceFade 1.4s ease-out;
    text-align: center;
  }

  .success-title {
    font-size: 1.6rem;
    font-weight: 800;
  }

  .success-score {
    font-size: 1.2rem;
    margin-top: 0.25rem;
  }

  .empty-state {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .empty-state .card {
    padding: 2rem 2.5rem;
    border-radius: 1.5rem;
    background: rgba(15, 23, 42, 0.96);
    border: 1px dashed rgba(148, 163, 184, 0.6);
    max-width: 28rem;
    text-align: center;
  }

  .empty-state .title {
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .empty-state .body {
    font-size: 0.95rem;
    color: #e5e7eb;
  }

  .empty-state code {
    padding: 0.1rem 0.35rem;
    border-radius: 0.45rem;
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.6);
    font-size: 0.85rem;
  }

  @keyframes bounceFade {
    0% {
      transform: translateY(18px);
      opacity: 0;
    }
    30% {
      transform: translateY(-6px);
      opacity: 1;
    }
    60% {
      transform: translateY(3px);
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>


