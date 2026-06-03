import { Board } from '../models/board';

export abstract class BoardRepository {
  abstract save(board: Board): Promise<void>;
  abstract findById(id: string): Promise<Board | undefined>;
  abstract delete(board: Board): Promise<void>;
}
