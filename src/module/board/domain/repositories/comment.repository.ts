import { Comment } from '../models/comment';

export abstract class CommentRepository {
  abstract save(comment: Comment): Promise<void>;
  abstract findById(id: string): Promise<Comment | undefined>;
  abstract delete(comment: Comment): Promise<void>;
}
