import {
  getUmbracoElementFinderApiV1UsageByAlias,
  getUmbracoElementFinderApiV1AllTypes,
} from "../api/index.js";
import type { Usage, Elements } from "../api/types.gen.js";

export interface IGetInfoDataSource {
  getElementInfo(alias: string): Promise<Usage | null>;
  getAllDocumentTypes(): Promise<Elements[]>;
}

export class GetInfoDataSource implements IGetInfoDataSource {
  async getElementInfo(alias: string): Promise<Usage | null> {
    try {
      const response = await getUmbracoElementFinderApiV1UsageByAlias({
        path: {
          alias: alias,
        },
      });

      return response.data ?? null;
    } catch (error) {
      return null;
    }
  }

  async getAllDocumentTypes(): Promise<Elements[]> {
    try {
      const response = await getUmbracoElementFinderApiV1AllTypes();
      // Cast to Elements[] or ensure it's an array
      return (response.data as Elements[]) ?? [];
    } catch (error) {
      console.error("Failed to fetch document types:", error);
      return [];
    }
  }
}
