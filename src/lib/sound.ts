const click = new Audio('/audio/mouse-click.mp3')
click.preload = 'auto'
click.volume = 0.4

export function playClick() {
  click.currentTime = 0
  click.play().catch(() => {})
}
