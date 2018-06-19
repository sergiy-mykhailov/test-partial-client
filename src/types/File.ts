export type FileGroup = 'video' | 'image' | 'audio' | 'document';

export interface File {
  id: number;
  file_url: string;
  group: FileGroup;
  description: string;
}

export interface FileInput {
  file_url: string;
  group?: FileGroup;
  description?: string;
}
