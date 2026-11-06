<script lang="ts">
  let { onPower }: { onPower: () => void } = $props()
</script>

<div class="off">
  <button onclick={onPower} aria-label="Power On">
    <svg class="icon" viewBox="0 0 24 24" width="64" height="64" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true">
      <path d="M12 3v9" />
      <path d="M6.4 6.6a8 8 0 1 0 11.2 0" />
    </svg>
    <span>Click to Power On</span>
  </button>
</div>

<style>
  .off {
    position: fixed; inset: 0; background: #000;
    display: grid; place-items: center; z-index: 10000;
  }
  button {
    all: unset; cursor: pointer; display: flex; flex-direction: column; align-items: center;
    gap: 14px; color: #6b7280; font: 14px monospace; letter-spacing: 0.08em;
    animation: blink 1.6s ease-in-out infinite;
  }
  button:hover { color: #00ff00; }
  @keyframes blink { 50% { opacity: 0.45; } }
</style>
