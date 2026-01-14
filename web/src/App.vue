<template>
  <div class="flex h-screen w-full bg-bg-body font-sans text-text-main">
    
    <Sidebar :is-open="isSidebarOpen" />

    <main class="flex-1 flex flex-col h-full relative transition-all bg-bg-body">
      
      <header class="h-14 flex items-center justify-between px-4 sticky top-0 bg-bg-body/80 backdrop-blur-md z-10">
        <div class="flex items-center gap-2">
            <button @click="isSidebarOpen = !isSidebarOpen" class="p-2 rounded-lg text-text-muted hover:bg-bg-card hover:text-text-main transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            </button>
            <span class="font-semibold text-sm opacity-60">InternOps v2.0</span>
        </div>
        
        <select class="bg-bg-surface border border-border-col text-xs font-semibold text-text-main rounded-lg px-3 py-1.5 outline-none focus:border-primary cursor-pointer shadow-sm">
            <option value="strict">Strict Mode</option>
            <option value="real-world" selected>Real World Scenario</option>
            <option value="brutal">Brutal Mode</option>
        </select>
      </header>

      <div class="flex-1 overflow-y-auto px-4 py-6 scroll-smooth" ref="chatContainer">
        
        <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center opacity-90 pb-20">
            <div class="w-16 h-16 rounded-2xl brand-gradient-bg flex items-center justify-center shadow-lg mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h2 class="text-2xl font-bold mb-2">How can I help you filter today?</h2>
            <p class="text-text-muted text-sm max-w-md text-center">I can analyze resumes against job descriptions, detect red flags, and simulate engineering manager feedback.</p>
        </div>

        <div v-else class="max-w-3xl mx-auto space-y-6 pb-24">
            <div v-for="(msg, index) in messages" :key="index" class="flex gap-4 group">
                <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                     :class="msg.role === 'user' ? 'bg-bg-card' : 'brand-gradient-bg text-white shadow-soft'">
                    <span v-if="msg.role === 'user'" class="text-xs font-bold text-text-muted">YOU</span>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>

                <div class="flex-1 pt-1">
                    <p class="font-bold text-sm mb-1 text-text-main">{{ msg.role === 'user' ? 'You' : 'InternOps' }}</p>
                    <div class="text-sm leading-relaxed text-text-main markdown-body">
                        {{ msg.content }}
                    </div>

                    <div v-if="msg.hasResult" class="mt-4 bg-bg-surface border border-border-col rounded-brand p-5 shadow-surface max-w-lg">
                        <div class="flex items-center justify-between mb-4 pb-4 border-b border-border-col">
                            <div>
                                <span class="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1">ATS Match Score</span>
                                <div class="font-bold text-success">Result: HIRE</div>
                            </div>
                            <div class="text-2xl font-extrabold text-text-main">92%</div>
                        </div>
                        <div class="flex flex-wrap gap-2">
                             <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-green-500/10 text-success border border-green-500/20">React.js</span>
                             <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-green-500/10 text-success border border-green-500/20">Vue.js</span>
                             <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-bg-card text-text-muted border border-border-col">TypeScript</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-bg-body via-bg-body to-transparent pb-2 pt-10">
        <ChatInput @send="handleSend" />
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import Sidebar from './components/Sidebar.vue';
import ChatInput from './components/ChatInput.vue';

const isSidebarOpen = ref(true);
const messages = ref([]);

const handleSend = async (text) => {
    // 1. Add User Message
    messages.value.push({
        role: 'user',
        content: text
    });

    // 2. Simulate Response Loading
    await nextTick();
    scrollToBottom();
    
    setTimeout(() => {
        messages.value.push({
            role: 'assistant',
            content: "I've analyzed the resume against the job description. Here is the detailed breakdown based on the 'Real World' strategy.",
            hasResult: true // Triggers the card view similar to extension
        });
        nextTick(() => scrollToBottom());
    }, 1000);
};

const scrollToBottom = () => {
    const container = document.querySelector('.overflow-y-auto'); // simple selector for demo
    if(container) container.scrollTop = container.scrollHeight;
}
</script>

<style>
/* Utilities specific to formatting result content */
.markdown-body {
    line-height: 1.6;
}
</style>