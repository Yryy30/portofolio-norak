<script lang="ts">
  import { content } from '$lib/stores/content.svelte'
  import { projects } from '$lib/stores/projects.svelte'
  import { api } from '$lib/api/client'
  import ProjectCard from '$lib/components/project/ProjectCard.svelte'
  import type { Route } from '$lib/routes'
  import type { Project, Skill } from '@shared/types'

  let { onNavigate, onOpenProject }: {
    onNavigate: (r: Route) => void
    onOpenProject: (p: Project) => void
  } = $props()

  let skills = $state<Skill[]>([])

  $effect(() => {
    projects.load()
    api.skills().then((s) => (skills = s)).catch(() => {})
  })

  const featured = $derived(projects.list.filter((p) => p.featured).slice(0, 3))
  const name = $derived(content.t('home_name', ''))
</script>

<section class="hero card">
  {#if content.t('home_image')}
    <img class="avatar" alt="" src={content.t('home_image')} />
  {:else}
    <div class="avatar ph">{name.charAt(0).toUpperCase() || '?'}</div>
  {/if}

  <div class="txt">
    {#if content.t('home_status')}
      <span class="status"><i></i>{content.t('home_status')}</span>
    {/if}
    <h1 class="page-title">{name}</h1>
    <p class="role">{content.t('home_role')}</p>
    <p class="intro">{content.t('home_intro')}</p>
    <div class="actions">
      <button class="btn" onclick={() => onNavigate('project')}>Projects</button>
      <button class="btn btn-ghost" onclick={() => onNavigate('contact')}>Contact Me</button>
    </div>
  </div>
</section>

{#if skills.length}
  <h2 class="section-title">Skills</h2>
  <div class="skills">
    {#each skills as s (s.id)}
      <div class="skill card">
        <div class="top">
          <span>{s.name}</span>
          {#if s.level !== null}<b>{s.level}%</b>{/if}
        </div>
        {#if s.level !== null}
          <div class="bar"><div class="fill" style:width="{s.level}%"></div></div>
        {/if}
      </div>
    {/each}
  </div>
{/if}

{#if featured.length}
  <h2 class="section-title">Featured Project</h2>
  <div class="grid">
    {#each featured as p (p.id)}
      <ProjectCard project={p} onOpen={onOpenProject} />
    {/each}
  </div>
{/if}

<style>
  .hero { display: flex; gap: 24px; padding: 24px; align-items: center; flex-wrap: wrap; }
  .avatar {
    width: 140px; height: 140px; border-radius: 50%; object-fit: cover; flex: none;
    border: 4px solid var(--accent-soft); box-shadow: var(--shadow);
  }
  .avatar.ph {
    display: grid; place-items: center; font-size: 3.5rem; font-weight: 700; color: #fff;
    background: linear-gradient(135deg, #3a6ea5, #6aa0d8);
  }
  .txt { flex: 1; min-width: 240px; display: flex; flex-direction: column; gap: 8px; }
  .status {
    align-self: flex-start; display: inline-flex; align-items: center; gap: 6px;
    padding: 3px 10px; border-radius: 999px; background: #dcfce7; color: #166534;
    font-size: 0.78rem; font-weight: 600;
  }
  .status i { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }
  .role { color: var(--accent); font-weight: 600; font-size: 1.05rem; }
  .intro { color: #374151; white-space: pre-line; }
  .actions { display: flex; gap: 10px; margin-top: 6px; flex-wrap: wrap; }

  .skills { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
  .skill { padding: 12px 14px; }
  .top { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 8px; }
  .bar { height: 8px; border-radius: 999px; background: var(--accent-soft); overflow: hidden; }
  .fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #3a6ea5, #6aa0d8); }
</style>
