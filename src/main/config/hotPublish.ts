import { build } from '@config/index.js'
interface hotPublish {
    url: string;
    configName: string;
}

export const hotPublishConfig: hotPublish = {
    url: '',
    configName: build.hotPublishConfigName
}