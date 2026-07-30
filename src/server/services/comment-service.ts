import { CommentRepository } from "@/server/repositories/comment-repository";
import { NotificationService } from "@/server/services/notification-service";
import { prisma } from "@/server/db";
import { isDatabaseEnabled } from "@/server/utils/env";
import { ForbiddenError, NotFoundError, ValidationError } from "@/server/errors";
import { requireString } from "@/server/utils/validation";

const MAX_COMMENT_LEN = 1000;

function sanitizeBody(raw: string): string {
  return raw
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_COMMENT_LEN);
}

export class CommentService {
  constructor(
    private readonly comments = new CommentRepository(),
    private readonly notifications = new NotificationService()
  ) {}

  private requireDb() {
    if (!isDatabaseEnabled()) {
      throw new ValidationError("Comments require USE_DATABASE=true");
    }
  }

  async list(
    postId: string,
    options: { limit?: number; cursor?: string | null; parentId?: string | null } = {}
  ) {
    this.requireDb();
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundError("Post not found");
    return this.comments.listForPost(postId, options);
  }

  async create(
    userId: string,
    input: { postId: string; body: string; parentId?: string | null }
  ) {
    this.requireDb();
    const body = sanitizeBody(requireString(input.body, "body"));
    if (body.length < 1) throw new ValidationError("Comment cannot be empty");

    const post = await prisma.post.findUnique({
      where: { id: input.postId },
      include: { designer: { select: { ownerUserId: true } } },
    });
    if (!post) throw new NotFoundError("Post not found");

    let parentAuthorId: string | null = null;
    if (input.parentId) {
      const parent = await this.comments.findById(input.parentId);
      if (!parent || parent.postId !== input.postId) {
        throw new ValidationError("Invalid parent comment");
      }
      parentAuthorId = parent.userId;
    }

    const comment = await this.comments.create({
      postId: input.postId,
      userId,
      body,
      parentId: input.parentId ?? null,
    });

    if (parentAuthorId && parentAuthorId !== userId) {
      await this.notifications
        .notifyCommentReply(parentAuthorId, userId, input.postId, comment.id)
        .catch(() => undefined);
    } else {
      const ownerId = post.designer?.ownerUserId;
      if (ownerId && ownerId !== userId) {
        await this.notifications
          .notifyPostCommented(ownerId, userId, input.postId, comment.id)
          .catch(() => undefined);
      }
    }

    const commentsCount = (
      await prisma.post.findUnique({
        where: { id: input.postId },
        select: { commentsCount: true },
      })
    )?.commentsCount ?? 0;

    return { comment, commentsCount };
  }

  async update(userId: string, commentId: string, bodyRaw: string) {
    this.requireDb();
    const body = sanitizeBody(requireString(bodyRaw, "body"));
    if (body.length < 1) throw new ValidationError("Comment cannot be empty");
    const updated = await this.comments.update(commentId, userId, body);
    if (!updated) throw new ForbiddenError("You can only edit your own comments");
    return updated;
  }

  async remove(userId: string, commentId: string) {
    this.requireDb();
    const deleted = await this.comments.delete(commentId, userId);
    if (!deleted) throw new ForbiddenError("You can only delete your own comments");
    const commentsCount = (
      await prisma.post.findUnique({
        where: { id: deleted.postId },
        select: { commentsCount: true },
      })
    )?.commentsCount ?? 0;
    return { deleted: true, postId: deleted.postId, commentsCount: Math.max(0, commentsCount) };
  }
}
