<script lang="ts">
  interface Props {
    text: string
    direction?: 'left' | 'right' | 'up' | 'down'
    height?: number
    speed?: number
    bounce?: boolean
  }
  let { text, direction = 'left', height = 0, speed = 10, bounce = false }: Props = $props()

  const vertical = $derived(direction === 'up' || direction === 'down')
  const reverse = $derived(direction === 'right' || direction === 'down')
</script>

<div class="marquee" class:vertical style:height={vertical && height ? `${height}px` : undefined}>
  <div
    class="track"
    class:reverse
    class:bounce
    style:animation-duration="{speed}s"
  >
    {text}
  </div>
</div>

<style>
  .marquee {
    background: lime;
    font-weight: bold;
    border: 3px solid red;
    padding: 5px;
    overflow: hidden;
    white-space: nowrap;
  }
  .marquee.vertical { white-space: normal; position: relative; }

  .track { display: inline-block; animation: left linear infinite; padding-left: 100%; }
  .track.reverse { animation-name: right; }
  .track.bounce { animation: bounce ease-in-out infinite alternate; padding-left: 0; }

  .vertical .track { display: block; padding: 0; animation-name: up; }
  .vertical .track.reverse { animation-name: down; }

  @keyframes left   { from { transform: translateX(0); }     to { transform: translateX(-100%); } }
  @keyframes right  { from { transform: translateX(-100%); } to { transform: translateX(0); } }
  @keyframes up     { from { transform: translateY(100%); }  to { transform: translateY(-100%); } }
  @keyframes down   { from { transform: translateY(-100%); } to { transform: translateY(100%); } }
  @keyframes bounce { from { transform: translateX(0); }     to { transform: translateX(calc(100cqw - 100%)); } }
</style>
