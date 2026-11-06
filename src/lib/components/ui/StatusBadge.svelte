<script lang="ts">
  import type { ProjectStatus } from '@shared/types'

  let { status }: { status: ProjectStatus } = $props()
  const labels: Record<ProjectStatus, string> = {
    completed: 'Completed',
    'in-progress': 'In Progress',
    archived: 'Archived',
  }
</script>

<span class="badge" data-s={status}>{labels[status]}</span>

<style>
  .badge {
    display: inline-block; padding: 2px 9px; border-radius: 999px;
    font-size: 0.75rem; font-weight: 600; white-space: nowrap;
  }
  .badge[data-s='completed'] { background: #dcfce7; color: #166534; }
  .badge[data-s='in-progress'] { background: #fef3c7; color: #92400e; }
  .badge[data-s='archived'] { background: #e5e7eb; color: #4b5563; }
</style>
