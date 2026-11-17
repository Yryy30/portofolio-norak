<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    open: boolean
    title?: string
    width?: number
    onClose: () => void
    children: Snippet
  }
  let { open, title = 'WINDOW', width = 450, onClose, children }: Props = $props()

  let win = $state<HTMLDivElement>()
  let dragging = false
  let offX = 0
  let offY = 0

  $effect(() => {
    if (open && win) {
      win.style.left = `${Math.max(8, (window.innerWidth - win.offsetWidth) / 2)}px`
      win.style.top = `${Math.max(8, window.innerHeight * 0.06)}px`
    }
  })

  function startDrag(e: MouseEvent) {
    if (!win || (e.target as HTMLElement).closest('button')) return
    const r = win.getBoundingClientRect()
    dragging = true
    offX = e.clientX - r.left
    offY = e.clientY - r.top
  }

  $effect(() => {
    const move = (e: MouseEvent) => {
      if (!dragging || !win) return
      win.style.left = `${e.clientX - offX}px`
      win.style.top = `${Math.max(0, e.clientY - offY)}px`
    }
    const up = () => (dragging = false)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  })
</script>

<svelte:window onkeydown={(e) => open && e.key === 'Escape' && onClose()} />

{#if open}
  <div
    class="overlay"
    role="presentation"
    onmousedown={(e) => e.target === e.currentTarget && onClose()}
  >
    <div class="window" style:width="{width}px" bind:this={win} role="dialog" aria-modal="true" aria-label={title}>
      <div class="titlebar" role="presentation" onmousedown={startDrag}>
        <span class="ttl">{title}</span>
        <div class="ctrl">
          <span class="cbtn" aria-hidden="true">_</span>
          <span class="cbtn" aria-hidden="true">□</span>
          <button class="cbtn close" onclick={onClose} aria-label="Close">✕</button>
        </div>
      </div>
      <div class="body win98">{@render children()}</div>
    </div>
  </div>
{/if}

<style>
  .overlay { position: fixed; inset: 0; z-index: 9998; background: rgba(0, 0, 0, 0.25); }

  .window {
    position: absolute;
    max-width: calc(100vw - 16px);
    max-height: 88vh;
    display: flex; flex-direction: column;
    padding: 3px;
    background: #c0c0c0;
    border: 2px solid;
    border-color: #dfdfdf #404040 #404040 #dfdfdf;
    box-shadow: inset 1px 1px #fff, inset -1px -1px #808080, 4px 4px 0 rgba(0, 0, 0, 0.35);
    border-radius: 0;
    overflow: hidden;
    font-family: Tahoma, 'MS Sans Serif', sans-serif;
  }

  .titlebar {
    flex: none; display: flex; align-items: center; justify-content: space-between; gap: 8px;
    padding: 3px 3px 3px 6px; color: #fff; cursor: move; user-select: none;
    font: bold 13px Tahoma, sans-serif;
    background: linear-gradient(90deg, #000080, #1084d0);
  }
  .ttl { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .ctrl { display: flex; gap: 2px; }
  .ctrl .cbtn {
    all: unset; box-sizing: border-box;
    width: 18px; height: 16px; display: grid; place-items: center;
    background: #c0c0c0; color: #000; font: bold 11px/1 Tahoma, sans-serif;
    border: 2px solid; border-color: #fff #404040 #404040 #fff;
    box-shadow: inset -1px -1px #808080;
  }
  .ctrl .close { margin-left: 2px; cursor: pointer; }
  .ctrl .close:active { border-color: #404040 #fff #fff #404040; box-shadow: inset 1px 1px #808080; }

  .body {
    flex: 1; min-height: 0; overflow: auto; margin-top: 3px;
    background: #fff;
    border: 2px solid; border-color: #808080 #fff #fff #808080;
    box-shadow: inset 1px 1px #404040;
  }
</style>
