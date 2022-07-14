const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, threadId, useCasePayload) {
    await this._threadRepository.checkAvailabilityThread(threadId);
    const newComment = new NewComment({
      ...useCasePayload, threadId, owner: userId,
    });
    return this._commentRepository.addComment(newComment);
  }
}

module.exports = AddCommentUseCase;
