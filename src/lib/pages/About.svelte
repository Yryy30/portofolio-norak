<script lang="ts">
  const specs = [
    ['Frontend', 'Svelte 5 + Vite + TypeScript'],
    ['Backend', 'Hono + Cloudflare Workers'],
    ['Database', 'Cloudflare D1 (SQLite)'],
    ['Storage', 'Cloudflare R2'],
    ['Theme', 'BIOS, Windows XP, 2000s web style'],
  ]
</script>

<h1 class="page-title">About</h1>
<p class="page-sub">
  This portfolio is build for fun and nostalgic feeling.
  It is not a serious project, but a playground for me to learn and experiment with new technologies.
</p>

<h2 class="section-title">Tech Stack</h2>
<div class="card specs">
  {#each specs as [k, v]}
    <div class="row"><span>{k}</span><b>{v}</b></div>
  {/each}
</div>

<style>
  .specs { overflow: hidden; }
  .row { display: flex; gap: 16px; padding: 12px 16px; border-bottom: 1px solid var(--border); }
  .row:last-child { border-bottom: 0; }
  .row span { width: 130px; flex: none; color: var(--muted); }
</style>
