<script lang="ts">
  let stars = $state<{ x: number; y: number; id: number }[]>([])
  let counter = 0

  $effect(() => {
    const onMove = (e: MouseEvent) => {
      const id = counter++
      stars = [...stars.slice(-20), { x: e.clientX, y: e.clientY, id }]
      setTimeout(() => (stars = stars.filter((s) => s.id !== id)), 500)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  })
</script>

{#each stars as s (s.id)}
  <div class="star" style:left="{s.x}px" style:top="{s.y}px">✨</div>
{/each}

<style>
  .star { position: fixed; pointer-events: none; z-index: 9999; color: gold; }
</style>
