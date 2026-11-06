<script lang="ts">
  import type { Route } from '$lib/routes'

  let { onNavigate }: { onNavigate: (r: Route) => void } = $props()
  const items: { r: Route; label: string }[] = [
    { r: 'home', label: 'HOME' },
    { r: 'about', label: 'ABOUT' },
    { r: 'project', label: 'PROJECT' },
    { r: 'contact', label: 'CONTACT' },
  ]
</script>

<div class="navbar">
  {#each items as it}
    <button onclick={() => onNavigate(it.r)}>{it.label}</button>
  {/each}
</div>

<style>
  .navbar { border: 4px solid blue; background: cyan; padding: 10px; text-align: center; }
  button {
    background: pink; border: 3px outset black; padding: 10px; margin: 5px;
    font-weight: bold; cursor: help;
  }
  button:hover { background: red; color: white; }
</style>
