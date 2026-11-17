<script lang="ts">
  import { admin } from '$lib/api/admin'
  import type { ContentItem } from '@shared/types'

  let items = $state<ContentItem[]>([])
  let values = $state<Record<string, string>>({})
  let msg = $state('')
  let isErr = $state(false)
  let busy = $state(false)

  const groups = $derived([...new Set(items.map((i) => i.group))])

  function say(text: string, err = false) {
    msg = text
    isErr = err
  }

  $effect(() => {
    admin
      .content()
      .then((list) => {
        items = list
        values = Object.fromEntries(list.map((i) => [i.key, i.value]))
      })
      .catch((e) => say(e.message, true))
  })

  async function pick(key: string, e: Event) {
    const input = e.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    try {
      values[key] = (await admin.upload(file)).url
      say('Uploaded.')
    } catch (err) {
      say(err instanceof Error ? err.message : 'Failed to upload', true)
    }
    input.value = ''
  }

  async function save() {
    busy = true
    try {
      await admin.saveContent(values)
      say('Saved.')
    } catch (err) {
      say(err instanceof Error ? err.message : 'Failed to save', true)
    } finally {
      busy = false
    }
  }
</script>

{#each groups as g}
  <h2 class="group-title">{g}</h2>
  <div class="fields">
    {#each items.filter((i) => i.group === g) as it (it.key)}
      <label>
        {it.label}
        {#if it.type === 'textarea'}
          <textarea bind:value={values[it.key]}></textarea>
        {:else if it.type === 'number'}
          <input type="text" inputmode="numeric" bind:value={values[it.key]} />
        {:else}
          <span class="inline">
            <input type="text" bind:value={values[it.key]} />
            {#if it.type === 'url' && it.key.endsWith('_image')}
              <input type="file" accept="image/*" onchange={(e) => pick(it.key, e)} style="max-width:200px" />
            {/if}
          </span>
        {/if}
      </label>
    {/each}
  </div>
{/each}

<div class="foot">
  <button class="btn" onclick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
  {#if msg}<span class="msg" class:err={isErr}>{msg}</span>{/if}
</div>
