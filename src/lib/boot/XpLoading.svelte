<script lang="ts"></script>

<div class="xp">
  <h1>Windows XP</h1>
  <div class="loading">
    <div class="bar"></div>
  </div>
  <p>Starting Windows...</p>
</div>

<style>
  .xp {
    position: fixed;
    inset: 0;
    background: black;
    color: white;
    font-family: Tahoma;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .loading {
    width: 300px;
    height: 20px;
    border: 2px solid white;
    margin: 20px;
    overflow: hidden;
  }

  .bar {
    width: 100px;
    height: 100%;
    background: #3a6ea5;
    animation: xpbar 2s linear infinite;
  }

  @keyframes xpbar {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(300px); }
  }
</style>
