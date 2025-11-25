<script lang="ts">
  export let nikud: string | null = null;
  export let isCorrect = false;
  export let isError = false;
  export let isDragOver = false;

  export let onDrop: (event: DragEvent) => void;
  export let onDragOver: (event: DragEvent) => void;
  export let onDragLeave: () => void;
</script>

<div
  class="slot
    {nikud ? 'filled' : 'empty'}
    {isCorrect ? 'correct' : ''}
    {isError ? 'error' : ''}
    {isDragOver && !nikud ? 'hover' : ''}"
  role="button"
  tabindex="0"
  on:drop|preventDefault={onDrop}
  on:dragover|preventDefault={onDragOver}
  on:dragleave={onDragLeave}
>
  {#if nikud}
    <span class="char">{nikud}</span>
  {/if}
</div>

<style>
  .slot {
    width: 3.5rem;
    height: 2.5rem;
    border-radius: 999px;
    border: 3px dashed rgba(148, 163, 184, 0.7);
    background: rgba(15, 23, 42, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    font-weight: 600;
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
    border-color: #38bdf8;
    background: rgba(248, 250, 252, 0.08);
    box-shadow: 0 8px 20px rgba(56, 189, 248, 0.35);
  }

  .slot.correct {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.08);
  }

  .slot.error {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.08);
    animation: shake 0.3s ease-in-out;
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
</style>
