<script lang="ts">
  export let level: number;
  export let score: number;
  export let completedInLevel: number;
  export let totalInLevel: number;
</script>

<header class="header">
  <div class="header-main">
    <div class="pill pill-level">רמה {level}</div>
    <h1 class="title">אותיות</h1>
    <div class="pill pill-score">ניקוד: {score}</div>
  </div>
  <div class="header-progress">
    <div class="label">התקדמות ברמה</div>
    <div class="bar">
      <div
        class="fill"
        style={`width: ${(Math.min(completedInLevel, totalInLevel) / Math.max(totalInLevel, 1)) * 100}%`}
      ></div>
    </div>
    <div class="counter">
      {completedInLevel} / {totalInLevel} מילים
    </div>
  </div>
</header>

<style>
  .header {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
    text-align: center;
  }

  .header-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    width: 100%;
  }

  .title {
    font-size: 2.5rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-shadow: 0 10px 25px rgba(15, 23, 42, 0.6);
  }

  .pill {
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
    font-size: 0.95rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.45);
  }

  .pill-level {
    background: linear-gradient(135deg, #22c55e, #16a34a);
  }

  .pill-score {
    background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  }

  .header-progress {
    width: 100%;
    max-width: 28rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .label {
    font-size: 0.9rem;
    color: #e5e7eb;
  }

  .bar {
    width: 100%;
    height: 0.5rem;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.9);
    overflow: hidden;
    box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.8);
  }

  .fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #facc15, #f97316);
    transition: width 0.3s ease-out;
  }

  .counter {
    font-size: 0.85rem;
    color: #cbd5f5;
  }
</style>
