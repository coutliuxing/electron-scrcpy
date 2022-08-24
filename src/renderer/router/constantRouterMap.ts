export default [
    {path: '/:pathMatch(.*)*', component:()=> import("@renderer/views/404.vue")},
    // { path: '/', name: '总览', component: () => import('@renderer/components/LandingPage.vue') },
    { path: '/', name: '总览', component: () => import('@renderer/device/device.vue') },
    {path: '/converter',name: 'converter',
    component: () => import('@renderer/device/converter.vue'),meta:{showTop:false}},
    {path: '/remote_devices',name: 'remote_devices',
    component: () => import('@renderer/device/remote_devices.vue'),meta:{showTop:false}}
]