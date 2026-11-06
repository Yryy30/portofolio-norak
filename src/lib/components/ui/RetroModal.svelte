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
          <span aria-hidden="true">–</span>
          <span aria-hidden="true">▢</span>
          <button class="close" onclick={onClose} aria-label="Close">✕</button>
        </div>
      </div>
      <div class="body modern">{@render children()}</div>
    </div>
  </div>
{/if}

<style>
  .overlay { position: fixed; inset: 0; z-index: 9998; background: rgba(0, 20, 60, 0.35); }
  .window {
    position: absolute;
    max-width: calc(100vw - 16px);
    max-height: 88vh;
    display: flex; flex-direction: column;
    border: 3px solid #0831d9;
    border-radius: 9px 9px 4px 4px;
    background: #ece9d8;
    box-shadow: 4px 6px 18px rgba(0, 0, 0, 0.45);
    overflow: hidden;
  }
  .titlebar {
    flex: none; display: flex; align-items: center; justify-content: space-between; gap: 8px;
    padding: 5px 6px 5px 10px; color: #fff; cursor: move; user-select: none;
    font: bold 13px Tahoma, sans-serif; text-shadow: 1px 1px #0f1089;
    background: linear-gradient(180deg, #0997ff 0%, #0053ee 8%, #0050ee 40%, #0066ff 88%, #005bff 93%, #003dd7 100%);
  }
  .ttl { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ctrl { display: flex; gap: 3px; }
  .ctrl span, .ctrl button {
    width: 22px; height: 22px; display: grid; place-items: center; padding: 0;
    border: 1px solid #fff; border-radius: 3px; color: #fff; font-size: 12px; line-height: 1;
    background: linear-gradient(#5b8df5, #2a5fe0);
  }
  .ctrl .close { background: linear-gradient(#e99a80, #d4452a); cursor: pointer; }
  .ctrl .close:hover { filter: brightness(1.1); }
  .body { overflow: auto; background: #fff; }
</style>
