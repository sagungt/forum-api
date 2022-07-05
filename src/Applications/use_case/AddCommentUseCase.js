const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCaseParams, useCasePayload) {
    await this._verifyParams(useCaseParams);
    const { threadId } = useCaseParams;
    const date = new Date().toISOString();
    const newComment = new NewComment({
      ...useCasePayload, threadId, date, owner: userId,
    });
    return this._commentRepository.addComment(newComment);
  }

  async _verifyParams(params) {
    const { threadId } = params;

    await this._threadRepository.checkAvailabilityThread(threadId);
  }
}

module.exports = AddCommentUseCase;
