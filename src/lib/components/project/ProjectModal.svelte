<script lang="ts">
  import RetroModal from '$lib/components/ui/RetroModal.svelte'
  import StatusBadge from '$lib/components/ui/StatusBadge.svelte'
  import Gallery from './Gallery.svelte'
  import type { Project } from '@shared/types'

  let { project, onClose }: { project: Project | null; onClose: () => void } = $props()

  const images = $derived(
    project
      ? [
          ...(project.imageUrl ? [{ url: project.imageUrl, alt: project.title }] : []),
          ...project.images,
        ]
      : [],
  )
</script>

<RetroModal
  open={project !== null}
  title={project ? `${project.title} - Project Info` : ''}
  width={800}
  {onClose}
>
  {#if project}
    {#key project.id}
      <Gallery {images} title={project.title} />

      <div class="cols">
        <div class="main">
          <h2>{project.title}</h2>
          {#if project.summary}<p class="lead">{project.summary}</p>{/if}
          {#if project.description}<p class="desc">{project.description}</p>{/if}

          {#if project.features.length}
            <h3>Features</h3>
            <ul class="features">
              {#each project.features as f}<li>{f}</li>{/each}
            </ul>
          {/if}
        </div>

        <aside class="info">
          <dl>
            <dt>Status</dt>
            <dd><StatusBadge status={project.status} /></dd>
            {#if project.role}<dt>Role</dt><dd>{project.role}</dd>{/if}
            {#if project.year}<dt>Year</dt><dd>{project.year}</dd>{/if}
          </dl>

          {#if project.tech.length}
            <h4>Tech</h4>
            <div class="chips">
              {#each project.tech as t}<span class="chip">{t}</span>{/each}
            </div>
          {/if}

          <div class="actions">
            {#if project.url}
              <a class="btn" href={project.url} target="_blank" rel="noopener noreferrer">Live Demo ↗</a>
            {/if}
            {#if project.repoUrl}
              <a class="btn btn-ghost" href={project.repoUrl} target="_blank" rel="noopener noreferrer">Source Code ↗</a>
            {/if}
          </div>
        </aside>
      </div>
    {/key}
  {/if}
</RetroModal>

<style>
  .cols { display: grid; grid-template-columns: 1fr 230px; gap: 24px; padding: 20px; }
  @media (max-width: 640px) { .cols { grid-template-columns: 1fr; } }
  .main { display: flex; flex-direction: column; gap: 10px; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1rem; margin-top: 8px; }
  .lead { font-size: 1.02rem; font-weight: 500; }
  .desc { color: #374151; white-space: pre-line; }
  .features { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; }
  .features li { padding-left: 24px; position: relative; }
  .features li::before { content: '✓'; position: absolute; left: 0; color: #16a34a; font-weight: 700; }
  .info {
    align-self: start; display: flex; flex-direction: column; gap: 14px;
    padding: 16px; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius);
  }
  dl { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 8px 12px; align-items: center; }
  dt { color: var(--muted); font-size: 0.82rem; }
  dd { margin: 0; font-weight: 600; font-size: 0.9rem; }
  h4 { font-size: 0.82rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .actions { display: flex; flex-direction: column; gap: 8px; }
  .actions .btn { justify-content: center; }
</style>
