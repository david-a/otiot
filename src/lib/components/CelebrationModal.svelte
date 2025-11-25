<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let open = false;
  export let level: number;

  const dispatch = createEventDispatcher<{ next: void }>();
</script>

{#if open}
  <div class="backdrop">
    <div class="modal">
      <div class="title">כל הכבוד!</div>
      <div class="subtitle">סיימת את רמה {level}</div>
      <button class="btn" type="button" on:click={() => dispatch('next')}>
        לרמה הבאה
      </button>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: radial-gradient(circle at top, rgba(250, 204, 21, 0.16), rgba(15, 23, 42, 0.9));
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 40;
  }

  .modal {
    padding: 2.5rem 3rem;
    border-radius: 1.8rem;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(250, 204, 21, 0.45);
    text-align: center;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.9);
  }

  .title {
    font-size: 2.1rem;
    font-weight: 800;
    margin-bottom: 0.75rem;
  }

  .subtitle {
    font-size: 1.2rem;
    color: #e5e7eb;
    margin-bottom: 1.8rem;
  }

  .btn {
    min-width: 9rem;
    padding: 0.6rem 1.4rem;
    border-radius: 999px;
    border: none;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: #f9fafb;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 10px 24px rgba(22, 163, 74, 0.65);
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
  }

  .btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 16px 32px rgba(22, 163, 74, 0.85);
  }

  .btn:active {
    transform: translateY(1px);
    box-shadow: 0 6px 16px rgba(22, 163, 74, 0.7);
  }
</style>


