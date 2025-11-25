<script lang="ts">
  import { onMount } from 'svelte';
  import Game from '$lib/components/Game.svelte';
  import type { Progress } from '$lib/types';
  import { createPlayerId, loadProgress } from '$lib/storage/progress';

  let playerName = '';
  let playerId = '';
  let hasStarted = false;
  let progress: Progress | null = null;

  const LAST_NAME_KEY = 'otiot:lastPlayerName';

  onMount(() => {
    const browser = typeof window !== 'undefined';
    if (!browser) return;
    const savedName = window.localStorage.getItem(LAST_NAME_KEY);
    if (savedName) {
      playerName = savedName;
    }
  });

  const start = () => {
    const trimmed = playerName.trim();
    if (!trimmed) return;

    playerId = createPlayerId(trimmed);
    const browser = typeof window !== 'undefined';
    if (browser) {
      window.localStorage.setItem(LAST_NAME_KEY, trimmed);
    }
    progress = loadProgress(playerId);
    hasStarted = true;
  };

  const handleProgressUpdate = (event: CustomEvent<Progress>) => {
    progress = event.detail;
  };
</script>

<section class="page">
  <div class="panel">
    <header class="hero">
      <h1 class="logo">אותיות</h1>
      <p class="subtitle">משחק אינטראקטיבי בעברית ללימוד קריאה</p>
    </header>

    {#if !hasStarted}
      <div class="card">
        <h2 class="card-title">מתחילים לשחק</h2>
        <label class="field">
          <span class="field-label">איך קוראים לשחקן /ית?</span>
          <input
            class="field-input"
            bind:value={playerName}
            placeholder="הקלד /י שם"
            on:keydown={(e) => e.key === 'Enter' && start()}
          />
        </label>
        <button class="primary-btn" type="button" on:click={start}>
          להתחיל
        </button>
        <p class="hint">
          ההתקדמות נשמרת בדפדפן המקומי. אפשר לנהל מילים ותמונות דרך ה־CMS ב־
          <code>/admin</code>.
        </p>
      </div>
    {:else}
      <Game {playerName} {playerId} initialProgress={progress} on:progressUpdate={handleProgressUpdate} />
    {/if}
  </div>
</section>

<style>
  .page {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  .panel {
    width: 100%;
    max-width: 80rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .hero {
    text-align: center;
  }

  .logo {
    font-size: 3rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    margin-bottom: 0.3rem;
    text-shadow: 0 18px 45px rgba(15, 23, 42, 0.9);
  }

  .subtitle {
    font-size: 1.1rem;
    color: #e5e7eb;
  }

  .card {
    margin-inline: auto;
    margin-top: 0.5rem;
    max-width: 30rem;
    padding: 1.75rem 2rem 1.9rem;
    border-radius: 1.5rem;
    background: rgba(15, 23, 42, 0.96);
    border: 1px solid rgba(148, 163, 184, 0.55);
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.9);
  }

  .card-title {
    font-size: 1.6rem;
    font-weight: 800;
    margin-bottom: 1rem;
    text-align: center;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1rem;
  }

  .field-label {
    font-size: 0.95rem;
    color: #e5e7eb;
  }

  .field-input {
    padding: 0.6rem 0.9rem;
    border-radius: 0.8rem;
    border: 1px solid rgba(148, 163, 184, 0.7);
    background: rgba(15, 23, 42, 0.9);
    color: #f9fafb;
    font-size: 1rem;
    outline: none;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease,
      background 0.15s ease;
  }

  .field-input:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.65);
    background: rgba(15, 23, 42, 0.98);
  }

  .primary-btn {
    width: 100%;
    margin-top: 0.5rem;
    padding: 0.7rem 1.2rem;
    border-radius: 0.9rem;
    border: none;
    background: linear-gradient(135deg, #f97316, #facc15);
    color: #0f172a;
    font-weight: 800;
    font-size: 1.05rem;
    cursor: pointer;
    box-shadow: 0 18px 48px rgba(154, 52, 18, 0.9);
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
  }

  .primary-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 22px 58px rgba(154, 52, 18, 0.95);
  }

  .primary-btn:active {
    transform: translateY(1px);
    box-shadow: 0 12px 32px rgba(154, 52, 18, 0.9);
  }

  .hint {
    margin-top: 0.8rem;
    font-size: 0.9rem;
    color: #cbd5f5;
  }

  .hint code {
    padding: 0.1rem 0.35rem;
    border-radius: 0.4rem;
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.6);
    font-size: 0.8rem;
  }
</style>


