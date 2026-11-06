<script lang="ts">
  import Marquee from '$lib/components/ui/Marquee.svelte'

  interface Props {
    imgTop: string
    imgBottom: string
    marqueeText: string
    marqueeDirection?: 'up' | 'down'
    marqueeHeight?: number
    caption: string
  }
  let { imgTop, imgBottom, marqueeText, marqueeDirection = 'up', marqueeHeight = 100, caption }: Props = $props()
</script>

<div class="side">
  <img alt="" src={imgTop} />
  <Marquee text={marqueeText} direction={marqueeDirection} height={marqueeHeight} speed={6} />
  <img alt="" src={imgBottom} />
  <p>{caption}</p>
</div>

<style>
  .side {
    width: 120px; background: black; color: lime;
    font-family: monospace; font-size: 12px;
    padding: 5px; border: 3px solid yellow;
  }
  .side img { width: 100%; margin-bottom: 10px; }
</style>
