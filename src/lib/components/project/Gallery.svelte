<script lang="ts">
  let { images, title }: { images: { url: string; alt: string }[]; title: string } = $props()

  let idx = $state(0)
  const current = $derived(images[idx])
</script>

{#if images.length}
  <div class="gallery">
    <div class="main"><img src={current.url} alt={current.alt || title} /></div>
    {#if images.length > 1}
      <div class="thumbs">
        {#each images as img, i (img.url)}
          <button class:active={i === idx} onclick={() => (idx = i)} aria-label="Images {i + 1}">
            <img src={img.url} alt="" />
          </button>
        {/each}
      </div>
    {/if}
  </div>
{:else}
  <div class="placeholder"><span>{title.charAt(0).toUpperCase()}</span></div>
{/if}

<style>
  .main, .placeholder { aspect-ratio: 16 / 9; background: #0f172a; display: grid; place-items: center; }
  .main img { width: 100%; height: 100%; object-fit: contain; }
  .placeholder { background: linear-gradient(135deg, #3a6ea5, #6aa0d8); }
  .placeholder span { font-size: 4rem; font-weight: 700; color: rgba(255, 255, 255, 0.85); }
  .thumbs { display: flex; gap: 8px; padding: 10px 16px; background: #f4f6f9; overflow-x: auto; }
  .thumbs button {
    all: unset; cursor: pointer; flex: none; width: 72px; height: 44px;
    border: 2px solid transparent; border-radius: 6px; overflow: hidden; opacity: 0.65;
  }
  .thumbs button.active { border-color: var(--accent); opacity: 1; }
  .thumbs img { width: 100%; height: 100%; object-fit: cover; display: block; }
</style>
