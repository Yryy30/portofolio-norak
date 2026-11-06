<script lang="ts">
  import { content } from '$lib/stores/content.svelte'
  import { api } from '$lib/api/client'
  import type { ContactLink } from '@shared/types'

  let links = $state<ContactLink[]>([])
  let copied = $state<number | null>(null)

  $effect(() => {
    api.contactLinks().then((l) => (links = l)).catch(() => {})
  })

  async function copy(l: ContactLink) {
    try {
      await navigator.clipboard.writeText(l.value)
      copied = l.id
      setTimeout(() => {
        if (copied === l.id) copied = null
      }, 1500)
    } catch {
      /* clipboard is null */
    }
  }
</script>

<h1 class="page-title">Contact</h1>
<p class="page-sub">{content.t('contact_intro')}</p>

<div class="grid">
  {#each links as l (l.id)}
    <div class="card item">
      <div class="icon">{l.icon}</div>
      <div class="info">
        <span class="label">{l.label}</span>
        <span class="value">{l.value}</span>
      </div>
      <div class="acts">
        <button class="btn btn-ghost" onclick={() => copy(l)}>
          {copied === l.id ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  {/each}
</div>

<style>
  .item { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  .icon {
    width: 44px; height: 44px; border-radius: 10px; display: grid; place-items: center;
    font-size: 1.4rem; background: var(--accent-soft);
  }
  .info { display: flex; flex-direction: column; min-width: 0; }
  .label { color: var(--muted); font-size: 0.8rem; }
  .value { font-weight: 600; overflow-wrap: anywhere; }
  .acts { display: flex; gap: 8px;}
  .acts .btn { padding: 6px 14px; font-size: 0.85rem; }
</style>
