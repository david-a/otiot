<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let letter: string;
  export let index: number;
  export let isDragging = false;
  export let colorIndex = 0;

  const dispatch = createEventDispatcher<{
    dragstart: { index: number; letter: string; event: DragEvent };
    dragend: void;
    click: void;
  }>();

  let wasDragged = false;
  let mouseDownPos: { x: number; y: number } | null = null;

  const TILE_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#e11d48", "#8b5cf6"];

  $: background = TILE_COLORS[colorIndex % TILE_COLORS.length];

  function handleMouseDown(event: MouseEvent) {
    mouseDownPos = { x: event.clientX, y: event.clientY };
    wasDragged = false;
  }

  function handleDragStart(event: DragEvent) {
    wasDragged = true;
    dispatch("dragstart", { index, letter, event });
  }

  function handleDragEnd() {
    wasDragged = false;
    dispatch("dragend");
  }

  function handleMouseUp(event: MouseEvent) {
    if (mouseDownPos && !wasDragged) {
      const dx = Math.abs(event.clientX - mouseDownPos.x);
      const dy = Math.abs(event.clientY - mouseDownPos.y);
      if (dx < 5 && dy < 5) {
        dispatch("click");
      }
    }
    mouseDownPos = null;
  }
</script>

<div
  class="tile {isDragging ? 'dragging' : ''}"
  style={`background:${background}`}
  draggable="true"
  role="button"
  tabindex="0"
  on:mousedown={handleMouseDown}
  on:dragstart={handleDragStart}
  on:dragend={handleDragEnd}
  on:mouseup={handleMouseUp}
>
  {letter}
</div>

<style>
  .tile {
    width: 5rem;
    height: 5rem;
    border-radius: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: 700;
    color: #f9fafb;
    cursor: grab;
    user-select: none;
    box-shadow: 0 10px 20px rgba(15, 23, 42, 0.4);
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease,
      opacity 0.15s ease;
  }

  .tile:hover {
    transform: scale(1.08) translateY(-2px);
    box-shadow: 0 16px 32px rgba(15, 23, 42, 0.5);
  }

  .tile:active {
    cursor: grabbing;
  }

  .tile.dragging {
    opacity: 0.3;
    transform: scale(0.9);
    box-shadow: none;
  }
</style>
