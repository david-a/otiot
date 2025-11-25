<script lang="ts">
  // Root layout – keeps things minimal and framework-agnostic
</script>

<main class="app-root">
  <slot />
</main>

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
    background: radial-gradient(
      circle at top,
      #f97316 0,
      #0f172a 55%,
      #020617 100%
    );
    color: #f9fafb;
    min-height: 100%;
    direction: rtl;
  }

  .app-root {
    min-height: 100vh;
    display: flex;
    align-items: stretch;
    justify-content: center;
  }
</style>
