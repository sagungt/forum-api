const NewComment = require('../../Domains/comments/entities/NewComment');

class CommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async addComment(userId, threadId, useCasePayload) {
    await this._threadRepository.checkAvailabilityThread(threadId);
    const newComment = new NewComment({
      ...useCasePayload, threadId, owner: userId,
    });
    return this._commentRepository.addComment(newComment);
  }

  async deleteComment(userId, threadId, commentId) {
    await this._threadRepository.checkAvailabilityThread(threadId);
    await this._verifyOwner(userId, commentId);
    await this._commentRepository.softDeleteCommentById(commentId);
  }

  async _verifyOwner(userId, commentId) {
    const { owner } = await this._commentRepository
      .checkAvailabilityComment(commentId);

    if (userId !== owner) {
      throw new Error('DELETE_COMMENT.INVALID_OWNERSHIP');
    }
  }
}

module.exports = CommentUseCase;
