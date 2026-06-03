/** 글 작성 입력 DTO */
export interface CreatePostDto {
  /** 게시판 ID */
  boardId: string;
  /** 작성자 회원 ID */
  authorId: string;
  /** 글 제목 */
  title: string;
  /** 글 내용 */
  content: string;
  /** 첨부 파일 ID 목록 (선택) */
  attachmentIds?: string[];
}
