import { apiClient } from './api';

export interface OgData {
  title: string | null;
  imageUrl: string | null;
}

export async function fetchOgData(url: string): Promise<OgData> {
  try {
    return await apiClient<OgData>(`/api/og?url=${encodeURIComponent(url)}`);
  } catch {
    return { title: null, imageUrl: null };
  }
}
