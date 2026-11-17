<script lang="ts">
  import { admin } from '$lib/api/admin'
  import type { AdminProject, ProjectInput, ProjectStatus } from '@shared/types'

  interface Form {
    slug: string
    title: string
    summary: string
    description: string
    techText: string
    featuresText: string
    role: string
    yearText: string
    status: ProjectStatus
    url: string
    repoUrl: string
    featured: boolean
    published: boolean
    sortOrder: number
  }

  const blank = (): Form => ({
    slug: '', title: '', summary: '', description: '',
    techText: '', featuresText: '', role: '', yearText: '',
    status: 'completed', url: '', repoUrl: '',
    featured: false, published: true, sortOrder: 0,
  })

  const toForm = (p: AdminProject): Form => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    description: p.description,
    techText: p.tech.join(', '),
    featuresText: p.features.join('\n'),
    role: p.role,
    yearText: p.year === null ? '' : String(p.year),
    status: p.status,
    url: p.url ?? '',
    repoUrl: p.repoUrl ?? '',
    featured: p.featured,
    published: p.published,
    sortOrder: p.sortOrder,
  })

  const toInput = (f: Form): ProjectInput => ({
    slug: f.slug.trim(),
    title: f.title.trim(),
    summary: f.summary.trim(),
    description: f.description.trim(),
    tech: f.techText.split(',').map((s) => s.trim()).filter(Boolean),
    features: f.featuresText.split('\n').map((s) => s.trim()).filter(Boolean),
    role: f.role.trim(),
    year: f.yearText.trim() === '' ? null : Number(f.yearText),
    status: f.status,
    url: f.url.trim() || null,
    repoUrl: f.repoUrl.trim() || null,
    featured: f.featured,
    published: f.published,
    sortOrder: Number(f.sortOrder) || 0,
  })

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  let list = $state<AdminProject[]>([])
  let current = $state<AdminProject | null>(null)
  let creating = $state(false)
  let f = $state<Form>(blank())
  let slugTouched = false
  let msg = $state('')
  let isErr = $state(false)
  let busy = $state(false)
  let altText = $state('')

  const editing = $derived(creating || current !== null)

  function say(text: string, err = false) {
    msg = text
    isErr = err
  }

  async function load() {
    try {
      list = await admin.projects()
    } catch (e) {
      say(e instanceof Error ? e.message : 'Failed to load', true)
    }
  }

  $effect(() => {
    load()
  })

  function startNew() {
    current = null
    creating = true
    f = blank()
    slugTouched = false
    say('')
  }

  function edit(p: AdminProject) {
    current = p
    creating = false
    f = toForm(p)
    slugTouched = true
    say('')
  }

  function back() {
    current = null
    creating = false
    say('')
  }

  function onTitle() {
    if (creating && !slugTouched) f.slug = slugify(f.title)
  }

  // Replace the project in the list + the active one
  function sync(p: AdminProject) {
    const i = list.findIndex((x) => x.id === p.id)
    if (i >= 0) list[i] = p
    else list.push(p)
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    current = p
    creating = false
  }

  async function run<T>(fn: () => Promise<T>, ok: string): Promise<T | undefined> {
    busy = true
    try {
      const r = await fn()
      say(ok)
      return r
    } catch (err) {
      say(err instanceof Error ? err.message : 'Failed', true)
    } finally {
      busy = false
    }
  }

  async function save() {
    const input = toInput(f)
    const p = await run(
      () => (current ? admin.updateProject(current.id, input) : admin.createProject(input)),
      'Saved.',
    )
    if (p) {
      sync(p)
      f = toForm(p)
    }
  }

  async function remove() {
    if (!current || !confirm(`Delete "${current.title}"? Images will be deleted too.`)) return
    const id = current.id
    const r = await run(() => admin.deleteProject(id), 'Deleted.')
    if (r) {
      list = list.filter((x) => x.id !== id)
      back()
      say('Deleted.')
    }
  }

  async function pickCover(e: Event) {
    const input = e.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    if (!file || !current) return
    const p = await run(() => admin.setCover(current!.id, file), 'Cover updated.')
    if (p) sync(p)
    input.value = ''
  }

  async function dropCover() {
    if (!current) return
    const p = await run(() => admin.removeCover(current!.id), 'Cover removed.')
    if (p) sync(p)
  }

  async function pickImage(e: Event) {
    const input = e.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    if (!file || !current) return
    const p = await run(() => admin.addImage(current!.id, file, altText), 'Image added.')
    if (p) {
      sync(p)
      altText = ''
    }
    input.value = ''
  }

  async function dropImage(imageId: number) {
    if (!current) return
    const p = await run(() => admin.removeImage(current!.id, imageId), 'Image removed.')
    if (p) sync(p)
  }
</script>

{#if !editing}
  <div class="plist">
    {#each list as p (p.id)}
      <button class="prow" onclick={() => edit(p)}>
        {#if p.imageUrl}
          <img src={p.imageUrl} alt="" />
        {:else}
          <span class="ph">{p.title.charAt(0).toUpperCase()}</span>
        {/if}
        <span class="meta">
          <b>{p.title}</b>
          <small>{p.status}{p.year ? ` · ${p.year}` : ''}</small>
        </span>
        {#if p.featured}<span class="tag">★ featured</span>{/if}
        {#if !p.published}<span class="tag draft">draft</span>{/if}
      </button>
    {/each}
    {#if !list.length}<p class="page-sub" style="margin:0">No projects yet.</p>{/if}
  </div>

  <div class="foot">
    <button class="btn" onclick={startNew}>+ New Project</button>
    {#if msg}<span class="msg" class:err={isErr}>{msg}</span>{/if}
  </div>
{:else}
  <div class="foot" style="margin:0 0 18px">
    <button class="btn btn-ghost" onclick={back}>← Back</button>
    <h2 style="font-size:1rem">{current ? `Edit: ${current.title}` : 'New Project'}</h2>
  </div>

  <div class="fields">
    <div class="grid2">
      <label>Title
        <input type="text" bind:value={f.title} oninput={onTitle} />
      </label>
      <label>Slug
        <input type="text" bind:value={f.slug} oninput={() => (slugTouched = true)} />
      </label>
    </div>

    <label>Summary (short, shown on the card)
      <input type="text" bind:value={f.summary} />
    </label>

    <label>Description
      <textarea bind:value={f.description}></textarea>
    </label>

    <label>Tech (comma separated)
      <input type="text" placeholder="Svelte, TypeScript, D1" bind:value={f.techText} />
    </label>

    <label>Features (one per line)
      <textarea bind:value={f.featuresText}></textarea>
    </label>

    <div class="grid2">
      <label>Role
        <input type="text" bind:value={f.role} />
      </label>
      <label>Year
        <input type="text" inputmode="numeric" bind:value={f.yearText} />
      </label>
    </div>

    <div class="grid2">
      <label>Status
        <select bind:value={f.status}>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="archived">Archived</option>
        </select>
      </label>
      <label>Sort order (small = first)
        <input type="number" bind:value={f.sortOrder} />
      </label>
    </div>

    <div class="grid2">
      <label>Live demo URL
        <input type="text" placeholder="https://..." bind:value={f.url} />
      </label>
      <label>Repo URL
        <input type="text" placeholder="https://github.com/..." bind:value={f.repoUrl} />
      </label>
    </div>

    <div class="checks">
      <label class="check"><input type="checkbox" bind:checked={f.featured} /> Featured (shown on Home)</label>
      <label class="check"><input type="checkbox" bind:checked={f.published} /> Published</label>
    </div>
  </div>

  <div class="foot">
    <button class="btn" onclick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
    {#if current}
      <button class="btn btn-ghost" onclick={remove} disabled={busy}>Delete</button>
    {/if}
    {#if msg}<span class="msg" class:err={isErr}>{msg}</span>{/if}
  </div>

  {#if current}
    <h2 class="group-title">Cover</h2>
    <div class="inline">
      {#if current.imageUrl}<img class="thumb" src={current.imageUrl} alt="" />{/if}
      <input type="file" accept="image/*" onchange={pickCover} disabled={busy} />
      {#if current.imageUrl}
        <button class="mini danger" onclick={dropCover} aria-label="Remove cover">✕</button>
      {/if}
    </div>

    <h2 class="group-title">Gallery</h2>
    <div class="thumbs">
      {#each current.images as img (img.id)}
        <div class="gitem">
          <img src={img.url} alt={img.alt} />
          <button class="mini danger" onclick={() => dropImage(img.id)} aria-label="Delete image">✕</button>
        </div>
      {/each}
    </div>
    <div class="inline" style="margin-top:10px">
      <input type="text" placeholder="Alt text (optional)" bind:value={altText} />
      <input type="file" accept="image/*" onchange={pickImage} disabled={busy} style="max-width:220px" />
    </div>
  {:else}
    <p class="page-sub">Save the project first, then you can upload the cover and gallery.</p>
  {/if}
{/if}
