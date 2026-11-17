<script lang="ts">
  import { admin } from '$lib/api/admin'

  let { onSuccess }: { onSuccess: () => void } = $props()

  let password = $state('')
  let error = $state('')
  let busy = $state(false)

  async function submit(e: SubmitEvent) {
    e.preventDefault()
    busy = true
    error = ''
    try {
      await admin.login(password)
      onSuccess()
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to login'
    } finally {
      busy = false
    }
  }
</script>

<div class="login-wrap">
  <form class="login card" onsubmit={submit}>
    <h1 class="page-title">Login Admin</h1>
    <label>
      Password
      <input type="password" bind:value={password} autocomplete="current-password" required />
    </label>
    {#if error}<p class="msg err">{error}</p>{/if}
    <button class="btn" disabled={busy}>{busy ? 'Masuk…' : 'Masuk'}</button>
  </form>
</div>
