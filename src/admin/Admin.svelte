<script lang="ts">
  import '../styles/admin.css'
  import { admin } from '$lib/api/admin'
  import Login from './Login.svelte'
  import ContentEditor from './ContentEditor.svelte'
  import SkillsEditor from './SkillsEditor.svelte'
  import ContactEditor from './ContactEditor.svelte'

  type Tab = 'content' | 'skills' | 'contact'
  const tabs: { id: Tab; label: string }[] = [
    { id: 'content', label: 'Konten' },
    { id: 'skills', label: 'Skills' },
    { id: 'contact', label: 'Kontak' },
  ]

  let auth = $state<'checking' | 'out' | 'in'>('checking')
  let tab = $state<Tab>('content')

  $effect(() => {
    admin.me().then(() => (auth = 'in')).catch(() => (auth = 'out'))
  })

  async function logout() {
    await admin.logout().catch(() => {})
    auth = 'out'
  }
</script>

<svelte:head><title>Admin</title><meta name="robots" content="noindex" /></svelte:head>

<div class="admin win98">
  {#if auth === 'checking'}
    <p style="padding:24px">Loading…</p>
  {:else if auth === 'out'}
    <Login onSuccess={() => (auth = 'in')} />
  {:else}
    <div class="bar">
      <h1>Admin Panel</h1>
      <div class="inline">
        <a href="/">View Site ↗</a>
        <button class="btn btn-ghost" onclick={logout}>Logout</button>
      </div>
    </div>

    <div class="tabs">
      {#each tabs as t}
        <button class:active={tab === t.id} onclick={() => (tab = t.id)}>{t.label}</button>
      {/each}
    </div>

    <main>
      <div class="panel">
        {#if tab === 'content'}<ContentEditor />{/if}
        {#if tab === 'skills'}<SkillsEditor />{/if}
        {#if tab === 'contact'}<ContactEditor />{/if}
      </div>
    </main>
  {/if}
</div>
