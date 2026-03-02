import { type ManifestGlobalContext } from "@umbraco-cms/backoffice/extension-registry";

const contexts: Array<ManifestGlobalContext> = [
    {
        type: 'globalContext',
        alias: 'getInfo.context',
        name: 'Get Info context',
        js: () => import('../contexts/getInfo.context')
    }
]

export const manifests = [...contexts];