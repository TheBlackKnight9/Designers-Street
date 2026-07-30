import { prisma } from "@/server/db";

export class CommentRepository {
  async create(data: {
    postId: string;
    userId: string;
    body: string;
    parentId?: string | null;
  }) {
    return prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          postId: data.postId,
          userId: data.userId,
          body: data.body,
          parentId: data.parentId ?? null,
        },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      });
      await tx.post.update({
        where: { id: data.postId },
        data: { commentsCount: { increment: 1 } },
      });
      return comment;
    });
  }

  async update(id: string, userId: string, body: string) {
    const existing = await prisma.comment.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;
    return prisma.comment.update({
      where: { id },
      data: { body },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  async delete(id: string, userId: string) {
    const existing = await prisma.comment.findFirst({
      where: { id, userId },
      include: { replies: { select: { id: true } } },
    });
    if (!existing) return null;
    const deleteCount = 1 + existing.replies.length;
    await prisma.$transaction(async (tx) => {
      await tx.comment.delete({ where: { id } });
      await tx.post.update({
        where: { id: existing.postId },
        data: { commentsCount: { decrement: deleteCount } },
      });
    });
    return existing;
  }

  async listForPost(
    postId: string,
    options: { limit?: number; cursor?: string | null; parentId?: string | null } = {}
  ) {
    const limit = options.limit ?? 20;
    const rows = await prisma.comment.findMany({
      where: {
        postId,
        parentId: options.parentId === undefined ? null : options.parentId,
      },
      take: limit + 1,
      ...(options.cursor
        ? { cursor: { id: options.cursor }, skip: 1 }
        : {}),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { replies: true } },
      },
    });
    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    return {
      items: slice,
      nextCursor: hasMore ? slice[slice.length - 1]?.id ?? null : null,
    };
  }

  async findById(id: string) {
    return prisma.comment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        post: { select: { id: true, designerId: true } },
      },
    });
  }
}
