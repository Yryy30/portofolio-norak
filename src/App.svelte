<script lang="ts">
  import CursorTrail from '$lib/components/effects/CursorTrail.svelte'
  import Marquee from '$lib/components/ui/Marquee.svelte'
  import ProjectModal from '$lib/components/project/ProjectModal.svelte'
  import Bios from '$lib/boot/Bios.svelte'
  import XpLoading from '$lib/boot/XpLoading.svelte'
  import PowerOn from '$lib/boot/PowerOn.svelte'
  import Navbar from '$lib/layout/Navbar.svelte'
  import Sidebar from '$lib/layout/Sidebar.svelte'
  import Footer from '$lib/layout/Footer.svelte'
  import Home from '$lib/pages/Home.svelte'
  import About from '$lib/pages/About.svelte'
  import Projects from '$lib/pages/Projects.svelte'
  import Contact from '$lib/pages/Contact.svelte'
  import { content } from '$lib/stores/content.svelte'
  import { playClick } from '$lib/sound'
  import type { Route } from '$lib/routes'
  import type { Project } from '@shared/types'

  let stage = $state<'off' | 'bios' | 'xp' | 'site'>('off')
  let route = $state<Route>('home')
  let activeProject = $state<Project | null>(null)
  let audio = $state<HTMLAudioElement>()

  function navigate(r: Route) {
    route = r
  }
  const openProject = (p: Project) => (activeProject = p)

  function powerOn() {
    audio?.play().then(() => {
      audio!.pause()
      audio!.currentTime = 0
    }).catch(() => {})

    stage = 'bios'
    setTimeout(() => (stage = 'xp'), 2000)
    setTimeout(() => {
      stage = 'site'
      audio?.play().catch(() => {})
    }, 5000)
  }

  $effect(() => {
    content.load()
  })
</script>

<CursorTrail />
<svelte:window
  onpointerdown={(e) =>
    stage !== 'off' && (e.target as HTMLElement).closest('button, a') && playClick()}
/>

{#if stage === 'off'}<PowerOn onPower={powerOn} />{/if}
{#if stage === 'bios'}<Bios />{/if}
{#if stage === 'xp'}<XpLoading />{/if}

{#if stage === 'site'}
  <div class="wrapper">
    <Sidebar imgTop="/img/buffering.gif" imgBottom="/img/mrbean.gif"
      marqueeText="🔥 HOT 🔥 HOT 🔥 HOT 🔥" marqueeDirection="up" caption="UNDER CONSTRUCTION" />

    <div class="container">
      <div class="balloon">🟡</div>
      <Marquee text={content.t('welcome_marquee', '👾 Welcome! 👾')} speed={12} />
      <Navbar onNavigate={navigate} />

      <div class="content modern">
        {#key route}
          <div class="page">
            {#if route === 'home'}<Home onNavigate={navigate} onOpenProject={openProject} />{/if}
            {#if route === 'about'}<About />{/if}
            {#if route === 'project'}<Projects onOpenProject={openProject} />{/if}
            {#if route === 'contact'}<Contact />{/if}
          </div>
        {/key}
      </div>

      <Footer />
    </div>

    <Sidebar imgTop="/img/squidword.gif" imgBottom="/img/thingking.gif"
      marqueeText="🚀 WELCOME 🚀 WELCOME 🚀" marqueeDirection="down" caption="BEST VIEWED IN 800x600" />
  </div>
{/if}

<audio bind:this={audio} preload="auto" src="/audio/windows-xp-startup.mp3"></audio>

<ProjectModal project={activeProject} onClose={() => (activeProject = null)} />

<style>
  .wrapper { display: flex; justify-content: center; opacity: 95%; }
  .container {
    width: 900px; background: yellow; border: 8px solid black;
    padding: 10px; font-family: 'Comic Sans MS', cursive; position: relative;
  }
  .balloon { position: absolute; font-size: 24px; animation: runBorder 8s linear infinite; }
  .content {
    background: var(--bg); border: 1px solid #b8c4d6; border-radius: 8px;
    padding: 24px; min-height: 340px; margin-top: 10px;
    box-shadow: inset 0 0 0 3px #fff;
  }

  @keyframes runBorder {
    0% { top: -15px; left: 0; }
    25% { top: -15px; left: 100%; transform: translateX(-100%); }
    26% { top: 0; left: calc(100% - 10px); }
    50% { top: 100%; left: calc(100% - 10px); transform: translateY(-100%); }
    51% { top: calc(100% - 10px); left: 100%; }
    75% { top: calc(100% - 10px); left: 0; }
    76% { top: 100%; left: 0; }
    100% { top: 0; left: 0; }
  }
</style>
