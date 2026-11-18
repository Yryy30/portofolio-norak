<script lang="ts">
  import { admin, type SkillRow } from '$lib/api/admin'
  import { api } from '$lib/api/client'

  let rows = $state<SkillRow[]>([])
  let msg = $state('')
  let isErr = $state(false)
  let busy = $state(false)

  function say(text: string, err = false) {
    msg = text
    isErr = err
  }

  $effect(() => {
    api.skills()
      .then((s) => (rows = s.map((x) => ({ name: x.name, level: x.level }))))
      .catch((e) => say(e.message, true))
  })

  const add = () => rows.push({ name: '', level: 50 })
  const remove = (i: number) => rows.splice(i, 1)
  function move(i: number, d: -1 | 1) {
    const j = i + d
    if (j < 0 || j >= rows.length) return
    ;[rows[i], rows[j]] = [rows[j], rows[i]]
  }

  async function save() {
    busy = true
    try {
      await admin.saveSkills(
        rows.map((r) => ({
          name: r.name.trim(),
          level: r.level == null || (r.level as unknown) === '' ? null : Number(r.level),
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

<p class="page-sub" style="margin-top:0">Level 0–100, leave empty if you do not want to display the bar.</p>

<div class="rows">
  {#each rows as r, i}
    <div class="rowline">
      <input type="text" placeholder="Skill name" bind:value={r.name} />
      <input type="number" min="0" max="100" placeholder="%" bind:value={r.level} />
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
