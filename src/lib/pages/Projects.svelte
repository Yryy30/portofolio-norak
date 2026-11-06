<script lang="ts">
  import { projects } from '$lib/stores/projects.svelte'
  import ProjectCard from '$lib/components/project/ProjectCard.svelte'
  import type { Project } from '@shared/types'

  let { onOpenProject }: { onOpenProject: (p: Project) => void } = $props()

  let filter = $state('All')

  $effect(() => {
    projects.load()
  })

  const techs = $derived(['All', ...new Set(projects.list.flatMap((p) => p.tech))])
  const shown = $derived(
    filter === 'All' ? projects.list : projects.list.filter((p) => p.tech.includes(filter)),
  )
</script>

<h1 class="page-title">Project</h1>
<p class="page-sub">Click for details.</p>

{#if techs.length > 2}
  <div class="filters">
    {#each techs as t}
      <button class:active={filter === t} onclick={() => (filter = t)}>{t}</button>
    {/each}
  </div>
{/if}

{#if projects.error}<p>{projects.error}</p>{/if}

<div class="grid">
  {#each shown as p (p.id)}
    <ProjectCard project={p} onOpen={onOpenProject} />
  {/each}
</div>

{#if projects.loaded && !shown.length}
  <p class="empty">No projects found.</p>
{/if}

<style>
  .filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
  .filters button {
    all: unset; cursor: pointer; padding: 5px 14px; border-radius: 999px;
    border: 1px solid var(--border); background: #fff; font-size: 0.85rem; font-weight: 600;
  }
  .filters button:hover { background: var(--accent-soft); }
  .filters button.active { background: var(--accent); border-color: var(--accent); color: #fff; }
  .empty { color: var(--muted); }
</style>
