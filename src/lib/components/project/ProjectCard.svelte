<script lang="ts">
  import StatusBadge from '$lib/components/ui/StatusBadge.svelte'
  import type { Project } from '@shared/types'

  let { project, onOpen }: { project: Project; onOpen: (p: Project) => void } = $props()
</script>

<article class="card pcard">
  <div class="cover">
    {#if project.imageUrl}
      <img src={project.imageUrl} alt="" loading="lazy" />
    {:else}
      <span>{project.title.charAt(0).toUpperCase()}</span>
    {/if}
  </div>

  <div class="body">
    <div class="row">
      <h3><button class="stretch" onclick={() => onOpen(project)}>{project.title}</button></h3>
      <StatusBadge status={project.status} />
    </div>
    <p class="sum">{project.summary || project.description}</p>
    <div class="chips">
      {#each project.tech.slice(0, 4) as t}<span class="chip">{t}</span>{/each}
      {#if project.year}<span class="year">{project.year}</span>{/if}
    </div>
  </div>
</article>

<style>
  .pcard { position: relative; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.15s, box-shadow 0.15s; }
  .pcard:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(16, 24, 40, 0.14); }
  .cover {
    aspect-ratio: 16 / 9; display: grid; place-items: center; overflow: hidden;
    background: linear-gradient(135deg, #3a6ea5, #6aa0d8);
  }
  .cover img { width: 100%; height: 100%; object-fit: cover; }
  .cover span { font-size: 3rem; font-weight: 700; color: rgba(255, 255, 255, 0.85); }
  .body { padding: 14px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
  .row { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
  h3 { font-size: 1rem; }
  .stretch {
    all: unset; cursor: pointer; font-weight: 700; color: var(--text);
  }
  .stretch::after { content: ''; position: absolute; inset: 0; }
  .stretch:focus-visible::after { outline: 2px solid var(--accent); outline-offset: -2px; }
  .sum { color: var(--muted); font-size: 0.9rem; flex: 1; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  .year { margin-left: auto; color: var(--muted); font-size: 0.8rem; }
</style>
