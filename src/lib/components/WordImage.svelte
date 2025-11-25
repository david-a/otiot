<script lang="ts">
  import { playAudioForText, playAudioFromUrl } from "$lib/audio";
  import { deriveWordFromNikud } from "$lib/game/logic";
  import type { Word } from "$lib/types";

  export let word: Word;
  export let isPlaying = false;

  const handlePlay = async () => {
    if (isPlaying) return;
    if (word.soundUrl) {
      await playAudioFromUrl(word.soundUrl);
    } else {
      await playAudioForText(word.nikud);
    }
  };
</script>

<button class="card" type="button" on:click|preventDefault={handlePlay}>
  <div class="image-wrap">
    {#if word.imageUrl}
      <img src={word.imageUrl} alt={deriveWordFromNikud(word.nikud)} />
    {:else}
      <div class="placeholder">?</div>
    {/if}
  </div>
  <div class="caption">
    <div class="label">הקש /י לשמוע</div>
    <div class="word">{word.nikud}</div>
  </div>
</button>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    border-radius: 1.25rem;
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.35);
    cursor: pointer;
    box-shadow: 0 14px 32px rgba(15, 23, 42, 0.65);
    min-width: 10rem;
  }

  .image-wrap {
    width: 8rem;
    height: 8rem;
    border-radius: 1.25rem;
    overflow: hidden;
    background: radial-gradient(
      circle at top,
      #fbbf24,
      #f97316 45%,
      #7c2d12 100%
    );
    display: flex;
    align-items: center;
    justify-content: center;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .placeholder {
    font-size: 3rem;
    font-weight: 800;
    color: rgba(15, 23, 42, 0.85);
  }

  .caption {
    text-align: center;
  }

  .label {
    font-size: 0.9rem;
    color: #e5e7eb;
  }

  .word {
    font-size: 1.6rem;
    font-weight: 800;
    margin-top: 0.2rem;
  }
</style>
