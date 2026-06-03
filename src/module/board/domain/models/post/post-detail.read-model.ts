/** 글 첨부 ReadModel (글 상세 4.7 포함) */
export interface PostAttachmentReadModel {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  fileSize?: number;
  sortOrder: number;
}

/** 글 상세 ReadModel (4.7 / 4.8 생성 / 4.9 수정 응답) */
export interface PostDetailReadModel {
  id: string;
  boardId: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  attachments: PostAttachmentReadModel[];
}
