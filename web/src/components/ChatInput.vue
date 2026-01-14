<template>
  <div class="w-full max-w-3xl mx-auto p-4">
    <div class="relative bg-bg-surface border border-border-col rounded-2xl shadow-surface focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-300">
      
      <textarea 
        v-model="message"
        placeholder="Paste job description or ask about the resume..."
        class="w-full bg-transparent text-text-main placeholder-text-muted px-4 py-4 pr-12 rounded-2xl resize-none focus:outline-none max-h-48 overflow-y-auto"
        rows="1"
        @input="autoResize"
      ></textarea>

      <div class="flex items-center justify-between px-3 pb-3 pt-1">
        
        <label class="cursor-pointer group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-bg-card transition-colors">
            <input type="file" class="hidden" accept=".pdf" />
            <div class="w-6 h-6 rounded-full bg-bg-card border border-border-col flex items-center justify-center text-text-muted group-hover:text-primary group-hover:border-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
            </div>
            <span class="text-xs font-semibold text-text-muted group-hover:text-text-main">Upload Resume</span>
        </label>

        <button 
          @click="sendMessage"
          :disabled="!message"
          class="p-2 rounded-lg transition-all duration-200 shadow-soft"
          :class="message ? 'brand-gradient-bg text-white hover:scale-105' : 'bg-bg-card text-text-muted cursor-not-allowed'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
    <div class="text-center mt-2">
      <p class="text-[11px] text-text-muted">InternOps can make mistakes. Review generated results.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const message = ref('');
const emit = defineEmits(['send']);

const autoResize = (e) => {
  e.target.style.height = 'auto';
  e.target.style.height = e.target.scrollHeight + 'px';
};

const sendMessage = () => {
  if (!message.value.trim()) return;
  emit('send', message.value);
  message.value = '';
};
</script>