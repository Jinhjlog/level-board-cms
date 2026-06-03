/** 댓글 작성 입력 */
export interface CreateCommentDto {
  postId: string;
  userId: string;
  content: string;
}
