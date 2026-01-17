
import {createWebHistory, createRouter} from 'vue-router'

import App from '../views/App.vue'
import AnlaysisReport from '../views/AnlaysisReport.vue'

const routes = [
    {path: "/home", component: App},
    {path: "/analysis", component: AnlaysisReport}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;