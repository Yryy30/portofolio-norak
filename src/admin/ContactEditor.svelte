<script lang="ts">
  import { admin } from '$lib/api/admin'
  import { api } from '$lib/api/client'

  interface Row { label: string; value: string; url: string; icon: string }

  let rows = $state<Row[]>([])
  let msg = $state('')
  let isErr = $state(false)
  let busy = $state(false)

  function say(text: string, err = false) {
    msg = text
    isErr = err
  }

  $effect(() => {
    api.contactLinks()
      .then((l) => (rows = l.map((x) => ({ label: x.label, value: x.value, url: x.url ?? '', icon: x.icon }))))
      .catch((e) => say(e.message, true))
  })

  const add = () => rows.push({ label: '', value: '', url: '', icon: '🔗' })
  const remove = (i: number) => rows.splice(i, 1)
  function move(i: number, d: -1 | 1) {
    const j = i + d
    if (j < 0 || j >= rows.length) return
    ;[rows[i], rows[j]] = [rows[j], rows[i]]
  }

  async function save() {
    busy = true
    try {
      await admin.saveContactLinks(
        rows.map((r) => ({
          label: r.label.trim(),
          value: r.value.trim(),
          url: r.url.trim() || null,
          icon: r.icon.trim() || '🔗',
        })),
      )
      say('Saved')
    } catch (err) {
      say(err instanceof Error ? err.message : 'Failed to save', true)
    } finally {
      busy = false
    }
  }
</script>

<p class="page-sub" style="margin-top:0">
  http(s)://, mailto:, or tel:.
</p>

<div class="rows">
  {#each rows as r, i}
    <div class="rowline contact">
      <input type="text" placeholder="Icon" bind:value={r.icon} />
      <input type="text" placeholder="Label (Email)" bind:value={r.label} />
      <input type="text" placeholder="Text value" bind:value={r.value} />
      <input type="text" placeholder="Link" bind:value={r.url} />
      <span class="inline">
        <button class="mini" onclick={() => move(i, -1)} aria-label="Up">↑</button>
        <button class="mini" onclick={() => move(i, 1)} aria-label="Down">↓</button>
        <button class="mini danger" onclick={() => remove(i)} aria-label="Delete">✕</button>
      </span>
    </div>
  {/each}
</div>

<div class="foot">
  <button class="btn btn-ghost" onclick={add}>+ Add</button>
  <button class="btn" onclick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
  {#if msg}<span class="msg" class:err={isErr}>{msg}</span>{/if}
</div>
