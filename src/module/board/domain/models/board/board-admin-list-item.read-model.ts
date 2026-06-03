/** 관리용 게시판 목록 항목 ReadModel (4.4) */
export interface BoardAdminListItemReadModel {
  id: string;
  name: string;
  readLevel: number;
  writeLevel: number;
  commentLevel: number;
  managerId?: string;
  createdAt: Date;
}
