import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'
import FileBasedSimulation from '../components/FileBasedSimulation.vue'
import Layout from '../components/Layout.vue'
import PortfolioSimulation from '../components/PortfolioSimulation.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Layout,
      children: [
        {
          path: '',
          name: 'MainSimulation',
          component: PortfolioSimulation
        }
      ]
    },
    {
      path: '/file-simulation',
      name: 'FileSimulation',
      component: Layout,
      children: [
        {
          path: '',
          name: 'FileBasedSimulation',
          component: FileBasedSimulation
        }
      ]
    }
  ]
})

export default router
