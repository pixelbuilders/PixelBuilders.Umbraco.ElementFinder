import { getUmbracoElementFinderApiV1UsageByAlias } from '../api/index.js';
import type { Usage } from '../api/types.gen.js';

export interface IGetInfoDataSource {
    getElementInfo(alias: string): Promise<Usage | null>;
}

export class GetInfoDataSource implements IGetInfoDataSource {
    async getElementInfo(alias: string): Promise<Usage | null> {
      try {
        const response = await getUmbracoElementFinderApiV1UsageByAlias({
                path: {
                    alias: alias
                }
            });

            return response.data ?? null;
      } catch (error) {
        return null;
      }
    }
}
