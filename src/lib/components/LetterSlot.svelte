<script lang="ts">
  export let letter: string | null = null;
  export let isCorrect = false;
  export let isError = false;
  export let isDragOver = false;
  export let hasAnimated = false;

  export let onDrop: (event: DragEvent) => void;
  export let onDragOver: (event: DragEvent) => void;
  export let onDragLeave: () => void;
</script>

<div
  class="slot
    {letter ? 'filled' : 'empty'}
    {isCorrect ? 'correct' : ''}
    {isError ? 'error' : ''}
    {isDragOver && !letter ? 'hover' : ''}
    {isCorrect && hasAnimated ? 'bounce' : ''}"
  role="button"
  tabindex="0"
  on:drop|preventDefault={onDrop}
  on:dragover|preventDefault={onDragOver}
  on:dragleave={onDragLeave}
>
  {#if letter}
    <span class="char">{letter}</span>
  {/if}
</div>

<style>
  .slot {
    width: 5rem;
    height: 7rem;
    border-radius: 1rem;
    border: 4px dashed rgba(148, 163, 184, 0.7);
    background: rgba(15, 23, 42, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: 700;
    position: relative;
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease,
      border-color 0.15s ease,
      background 0.15s ease;
  }

  .slot.empty {
    border-style: dashed;
    background: rgba(15, 23, 42, 0.4);
  }

  .slot.filled {
    border-style: solid;
    border-color: rgba(148, 163, 184, 0.8);
    background: rgba(15, 23, 42, 0.9);
  }

  .slot.hover {
    transform: scale(1.05);
    border-color: #facc15;
    background: rgba(250, 250, 250, 0.08);
    box-shadow: 0 12px 28px rgba(250, 204, 21, 0.35);
  }

  .slot.correct {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.08);
    box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.4);
  }

  .slot.error {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.08);
    animation: shake 0.3s ease-in-out;
  }

  .slot.bounce {
    animation: bounce 0.5s ease-out;
  }

  .char {
    user-select: none;
  }

  @keyframes shake {
    10%,
    90% {
      transform: translateX(-2px);
    }
    20%,
    80% {
      transform: translateX(4px);
    }
    30%,
    50%,
    70% {
      transform: translateX(-8px);
    }
    40%,
    60% {
      transform: translateX(8px);
    }
  }

  @keyframes bounce {
    0% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(3px);
    }
    100% {
      transform: translateY(0);
    }
  }
</style>
