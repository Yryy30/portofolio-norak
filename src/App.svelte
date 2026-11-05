<script lang="ts">
  import type { HealthResponse } from '../shared/types'

  let status = $state('memeriksa API...')

  $effect(() => {
    fetch('/api/health')
      .then((r) => r.json() as Promise<HealthResponse>)
      .then((d) => (status = d.ok ? 'API OK ✔' : 'API error'))
      .catch(() => (status = 'API tidak terjangkau'))
  })
</script>

<main>
  <h1>My Portfolio</h1>
  <p>Setup awal. {status}</p>
</main>
