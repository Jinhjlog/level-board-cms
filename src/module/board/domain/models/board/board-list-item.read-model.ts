/** 회원용 게시판 목록 항목 ReadModel (4.5) — 관리 필드 제외 */
export interface BoardListItemReadModel {
  id: string;
  name: string;
  readLevel: number;
  writeLevel: number;
  commentLevel: number;
}
