<script setup lang="ts">
import { ref } from 'vue';

const splashMessages = [
  'Ask me for a visualization!',
  'Tell me what you\u2019d like to see!',
  'What data would you like to explore?',
  'Try asking for a chart!',
  'I\u2019m ready to visualize your data!',
  'Curious about your data? Just ask!',
];

const splashMessage = ref(splashMessages[Math.floor(Math.random() * splashMessages.length)]);
</script>

<template>
  <div class="splash-container">
    <!-- Hand-drawn arrow pointing left, responsive width -->
    <div>
      <svg
        class="splash-arrow"
        viewBox="0 0 200 60"
        fill="none"
        preserveAspectRatio="xMinYMid meet"
      >
        <path
          d="M190 32 C150 28, 80 25, 40 30 C25 32, 15 35, 8 38"
          stroke="#57B4E9"
          stroke-width="2.5"
          stroke-linecap="round"
          fill="none"
          stroke-dasharray="4 3"
        />
        <path
          d="M18 28 L6 38 L16 46"
          stroke="#57B4E9"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        />
      </svg>
    </div>

    <div class="splash-content q-mt-xl">
      <!-- Speech bubble (above mascot) -->
      <div class="speech-bubble">
        <span>{{ splashMessage }}</span>
        <div class="speech-tail" />
      </div>

      <!-- Mascot image -->
      <img src="/images/yac-mascot.svg" alt="YAC mascot" class="splash-mascot" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.splash-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  // justify-content: center;
  height: 100%;
  width: 100%;
  min-height: 400px;
  padding: 24px;
  box-sizing: border-box;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.splash-mascot {
  width: 240px;
  height: 240px;
  object-fit: contain;
}

.speech-bubble {
  position: relative;
  background: #e8f4fc;
  border: 1.5px solid #57b4e9;
  border-radius: 16px;
  padding: 12px 20px;
  font-size: 15px;
  color: #1a1a1a;
  max-width: 280px;
  text-align: center;

  .speech-tail {
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #57b4e9;

    &::after {
      content: '';
      position: absolute;
      top: -11.5px;
      left: -8px;
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid #e8f4fc;
    }
  }
}

.splash-arrow {
  width: 60%;
  max-width: 300px;
  min-width: 120px;
  height: auto;
  margin-top: 16px;
  opacity: 0.7;
  align-self: flex-start;
}
</style>
