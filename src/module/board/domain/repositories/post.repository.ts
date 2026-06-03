import { Post } from '../models/post';

export abstract class PostRepository {
  abstract save(post: Post): Promise<void>;
  abstract findById(id: string): Promise<Post | undefined>;
  abstract delete(post: Post): Promise<void>;
}
