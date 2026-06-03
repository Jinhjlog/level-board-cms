/** 게시판 상세 ReadModel (관리자 4.1 생성 / 4.2 수정 응답) */
export interface BoardDetailReadModel {
  id: string;
  name: string;
  readLevel: number;
  writeLevel: number;
  commentLevel: number;
  managerId?: string;
  createdAt: Date;
  updatedAt: Date;
}
