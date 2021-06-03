export default [
    {path: '/:pathMatch(.*)*', component:()=> import("@renderer/views/404.vue")},
    // { path: '/', name: '总览', component: () => import('@renderer/components/LandingPage.vue') },
    { path: '/', name: '总览', component: () => import('@renderer/device/device.vue') },
    {path: '/converter',name: 'converter',
    component: () => import('@renderer/device/converter.vue'),meta:{showTop:false}},
    // {path: '/device',name: 'device',
    // component: () => import('@renderer/stf/new_device/device.vue'),meta:{showTop:false}},
]