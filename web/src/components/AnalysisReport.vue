<script setup>
import { ref, onBeforeMount, watch, computed } from 'vue';
import { useRoute } from 'vue-router'
import { fetchAnalysisReport } from '../api';

const report = ref(null);
const loading = ref(true)      
const refreshing = ref(false)  
const route = useRoute()

// --- Data Fetching ---
onBeforeMount(async () => {
    await loadData(route.params.id, true)
})

watch(
    () => route.params.id,
    async (newId) => {
        await loadData(newId, false)
    }
)

async function loadData(id, isInitialLoad) {
    if (isInitialLoad) {
        loading.value = true
    } else {
        refreshing.value = true
    }

    try {
        const data = await fetchAnalysisReport(id)
        report.value = data
        console.log("Report Loaded: ", report.value)
    } catch (error) {
        console.error("Failed to load report", error);
    } finally {
        loading.value = false
        refreshing.value = false
    }
}

// --- Helpers ---
const getDecisionColor = (decision) => {
    if (!decision) return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    switch (decision.toUpperCase()) {
        case 'PASS':
        case 'HIRE': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        case 'FAIL':
        case 'NO_HIRE': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
        default: return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
};

const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-rose-400';
};

// --- Computed Properties ---
const finalDecision = computed(() => {
    if (!report.value?.final_result) return 'PENDING';
    if (report.value.final_result.hm_result) {
        return report.value.final_result.hm_result.decision;
    }
    return report.value.final_result.ats_result.decision;
});

const hasRecruiterData = computed(() => {
    return !!report.value?.final_result?.recruiter_result;
});

const hasHMData = computed(() => {
    return !!report.value?.final_result?.hm_result;
});
</script>

<template>
    <div class="h-full w-full bg-[#0f172a] text-slate-300 font-sans p-4 sm:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        
        <div v-if="loading" class="flex h-full items-center justify-center">
            <div class="text-slate-500 animate-pulse">Loading Report...</div>
        </div>

        <div v-else-if="report" class="flex justify-center min-h-min">
            
            <div 
                class="w-full max-w-4xl h-fit bg-[#1e293b] shadow-2xl rounded-xl border border-slate-700/50 overflow-hidden relative mb-10 transition-opacity duration-300 ease-in-out"
                :class="{ 'opacity-60 pointer-events-none': refreshing }"
            >
                
                <div class="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-[#38bdf8]"></div>

                <div class="p-8 sm:p-12 space-y-10">

                    <div class="border-b border-slate-700/50 pb-6">
                        <div class="flex justify-between items-start">
                            <div>
                                <h1 class="text-3xl font-extrabold text-white tracking-tight mb-2">
                                    📄 {{report.company}} <span class="text-slate-500">
                                        #{{ report.id }}
                                    </span>
                                </h1>
                                <div class="space-y-1 mt-3">
                                    <p class="text-sm text-slate-400">
                                        <strong class="text-slate-200">Target Role:</strong> 
                                        {{ report.role }}
                                    </p>
                                    <p class="text-sm text-slate-400">
                                        <strong class="text-slate-200">Mode:</strong> 
                                        <span class="inline-flex items-center gap-1.5 ml-1">
                                            🛡️ {{ report.mode.mode }}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            
                            <div class="hidden sm:flex flex-col items-end">
                                <div class="px-4 py-1.5 rounded text-sm font-bold border uppercase tracking-wider"
                                     :class="getDecisionColor(finalDecision)">
                                    {{ finalDecision }}
                                </div>
                                <span class="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Final Status</span>
                             </div>
                        </div>
                    </div>

                    <section>
                        <div class="flex items-center gap-3 mb-3">
                            <span class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-white font-bold text-sm">1</span>
                            <h2 class="text-xl font-bold text-white">ATS Screen <span class="text-slate-500 font-medium text-base">(Gatekeeper)</span></h2>
                        </div>
                        <blockquote class="border-l-4 border-slate-700 pl-4 py-1 mb-6 text-sm text-slate-500 italic">
                            Checks for keywords and formatting. If this fails, no human sees your resume.
                        </blockquote>

                        <ul class="space-y-3 text-sm">
                            <li class="flex items-start gap-2">
                                <span class="font-bold text-slate-200 min-w-[120px]">Match Score:</span>
                                <span class="font-bold" :class="getScoreColor(report.final_result.ats_result.match_score)">
                                    {{ report.final_result.ats_result.match_score }}/100
                                </span>
                            </li>
                            <li class="flex items-start gap-2">
                                <span class="font-bold text-slate-200 min-w-[120px]">Decision:</span>
                                <span class="px-2 py-0.5 rounded text-xs font-bold border uppercase" 
                                      :class="getDecisionColor(report.final_result.ats_result.decision)">
                                    {{ report.final_result.ats_result.decision }}
                                </span>
                            </li>
                            <li class="flex items-start gap-2">
                                <span class="font-bold text-slate-200 min-w-[120px] pt-1">Missing Keywords:</span>
                                <div v-if="report.final_result.ats_result.missing_keywords.length > 0" class="flex flex-wrap gap-2">
                                    <span v-for="kw in report.final_result.ats_result.missing_keywords" :key="kw" 
                                          class="px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded border border-rose-500/20 text-xs font-mono">
                                        {{ kw }}
                                    </span>
                                </div>
                                <span v-else class="text-slate-400 italic">None</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <span class="font-bold text-slate-200 min-w-[120px]">Formatting:</span>
                                <span v-if="report.final_result.ats_result.formatting_issues.length === 0" class="text-slate-400">None detected.</span>
                                <span v-else class="text-rose-400">{{ report.final_result.ats_result.formatting_issues.join(', ') }}</span>
                            </li>
                            <li class="flex items-start gap-2 mt-4">
                                <span class="font-bold text-slate-200 min-w-[120px]">Feedback:</span>
                                <p class="text-slate-400 italic">"{{ report.final_result.ats_result.feedback }}"</p>
                            </li>
                        </ul>
                    </section>

                    <div class="w-full h-px bg-slate-700/50"></div>

                    <template v-if="hasRecruiterData">
                        <section>
                            <div class="flex items-center gap-3 mb-3">
                                <span class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-white font-bold text-sm">2</span>
                                <h2 class="text-xl font-bold text-white">Recruiter Screen <span class="text-slate-500 font-medium text-base">(The Story)</span></h2>
                            </div>
                            <blockquote class="border-l-4 border-slate-700 pl-4 py-1 mb-6 text-sm text-slate-500 italic">
                                Checks for career progression and red flags.
                            </blockquote>

                            <ul class="space-y-3 text-sm">
                                <li class="flex items-start gap-2">
                                    <span class="font-bold text-slate-200 min-w-[140px]">Progression Score:</span>
                                    <span class="font-bold" :class="getScoreColor(report.final_result.recruiter_result.career_progression_score)">
                                        {{ report.final_result.recruiter_result.career_progression_score }}/100
                                    </span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <span class="font-bold text-slate-200 min-w-[140px]">Decision:</span>
                                    <span class="px-2 py-0.5 rounded text-xs font-bold border uppercase" 
                                          :class="getDecisionColor(report.final_result.recruiter_result.decision)">
                                        {{ report.final_result.recruiter_result.decision }}
                                    </span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <span class="font-bold text-slate-200 min-w-[140px]">Red Flags:</span>
                                    <span v-if="report.final_result.recruiter_result.red_flags.length === 0" class="text-slate-400">None.</span>
                                    <span v-else class="text-rose-400 font-bold">{{ report.final_result.recruiter_result.red_flags.join(', ') }}</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <span class="font-bold text-slate-200 min-w-[140px] pt-1">Soft Skills:</span>
                                    <div class="flex flex-wrap gap-2">
                                        <span v-for="skill in report.final_result.recruiter_result.soft_skills_detected" :key="skill" 
                                              class="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20 text-xs">
                                            {{ skill }}
                                        </span>
                                    </div>
                                </li>
                                <li class="flex items-start gap-2 mt-4">
                                    <span class="font-bold text-slate-200 min-w-[140px]">Feedback:</span>
                                    <p class="text-slate-400 italic">"{{ report.final_result.recruiter_result.feedback }}"</p>
                                </li>
                            </ul>
                        </section>

                        <div v-if="hasHMData" class="w-full h-px bg-slate-700/50"></div>
                    </template>

                    <template v-else>
                        <div class="flex flex-col items-center justify-center py-8 opacity-50">
                            <div class="text-4xl mb-2">🛑</div>
                            <h3 class="text-lg font-bold text-rose-400">Analysis Halted</h3>
                            <p class="text-slate-500 text-sm">Application did not pass ATS screening.</p>
                        </div>
                    </template>

                    <template v-if="hasHMData">
                        <section>
                            <div class="flex items-center gap-3 mb-3">
                                <span class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-white font-bold text-sm">3</span>
                                <h2 class="text-xl font-bold text-white">Hiring Manager Screen <span class="text-slate-500 font-medium text-base">(The Proof)</span></h2>
                            </div>
                            <blockquote class="border-l-4 border-slate-700 pl-4 py-1 mb-6 text-sm text-slate-500 italic">
                                Checks for technical depth and impact metrics.
                            </blockquote>

                            <ul class="space-y-3 text-sm">
                                <li class="flex items-start gap-2">
                                    <span class="font-bold text-slate-200 min-w-[140px]">Tech Depth Score:</span>
                                    <span class="font-bold" :class="getScoreColor(report.final_result.hm_result.tech_depth_score)">
                                        {{ report.final_result.hm_result.tech_depth_score }}/100
                                    </span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <span class="font-bold text-slate-200 min-w-[140px]">Project Impact:</span>
                                    <span class="font-bold" :class="getScoreColor(report.final_result.hm_result.project_impact_score)">
                                        {{ report.final_result.hm_result.project_impact_score }}/100
                                    </span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <span class="font-bold text-slate-200 min-w-[140px]">Stack Alignment:</span>
                                    <span class="text-slate-300">{{ report.final_result.hm_result.stack_alignment }}</span>
                                </li>
                                 <li class="flex items-start gap-2">
                                    <span class="font-bold text-slate-200 min-w-[140px]">Decision:</span>
                                    <span class="px-2 py-0.5 rounded text-xs font-bold border uppercase" 
                                          :class="getDecisionColor(report.final_result.hm_result.decision)">
                                        {{ report.final_result.hm_result.decision }}
                                    </span>
                                </li>
                                <li class="flex items-start gap-2 mt-4">
                                    <span class="font-bold text-slate-200 min-w-[140px]">Feedback:</span>
                                    <p class="text-slate-400 italic">"{{ report.final_result.hm_result.feedback }}"</p>
                                </li>
                            </ul>
                        </section>
                    </template>

                </div>
            </div>
        </div>
    </div>
</template>