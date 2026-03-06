import type {
  SparkPage,
  CreateSparkPageRequest,
  PaginatedResponse,
} from "../types/index.js";
import { BaseClient } from "./base.js";

export class PagesClient extends BaseClient {
  /**
   * Fetch a Spark page by its ID or slug.
   */
  async get(idOrSlug: string): Promise<SparkPage> {
    return this.get<SparkPage>(`/api/pages/${encodeURIComponent(idOrSlug)}`);
  }

  /**
   * List all public pages, optionally filtered by tag.
   */
  async list(options: {
    tag?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<PaginatedResponse<SparkPage>> {
    const params: Record<string, string> = {
      page: String(options.page ?? 1),
      page_size: String(options.pageSize ?? 20),
    };
    if (options.tag) params["tag"] = options.tag;

    return this.get<PaginatedResponse<SparkPage>>("/api/pages", params);
  }

  /**
   * Create a new Spark page from a query.
   */
  async create(request: CreateSparkPageRequest): Promise<SparkPage> {
    return this.post<SparkPage>("/api/pages", {
      title: request.title,
      query: request.query,
      tags: request.tags ?? [],
      visibility: request.visibility ?? "public",
    });
  }

  /**
   * Delete a Spark page by ID.
   */
  async delete(id: string): Promise<void> {
    await this.post<void>(`/api/pages/${encodeURIComponent(id)}/delete`, {});
  }

  /**
   * List pages owned by the authenticated user.
   */
  async listMine(options: { page?: number; pageSize?: number } = {}): Promise<
    PaginatedResponse<SparkPage>
  > {
    return this.get<PaginatedResponse<SparkPage>>("/api/pages/mine", {
      page: String(options.page ?? 1),
      page_size: String(options.pageSize ?? 20),
    });
  }
}
