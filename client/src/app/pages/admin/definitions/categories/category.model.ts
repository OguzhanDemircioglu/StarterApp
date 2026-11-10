/** Backend DTO'larının birebir karşılığı (server: modules/category/dto). */

export interface CategoryResponse {
  id: number;
  name: string;
  description: string | null;
  version: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CategoryCreateRequest {
  name: string;
  description: string | null;
}

/** version: düzenlenen kaydın version'ı geri gönderilir; bu arada değiştiyse backend 409 record_modified döner. */
export interface CategoryUpdateRequest extends CategoryCreateRequest {
  version: number;
}
