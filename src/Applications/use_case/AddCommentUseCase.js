const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, useCaseParams, useCaseAuth) {
    await this._verifyParams(useCaseParams);
    const { threadId } = useCaseParams;
    const { id: owner } = useCaseAuth.credentials;
    const date = new Date().toISOString();
    const newComment = new NewComment({
      ...useCasePayload, threadId, date, owner,
    });
    return this._commentRepository.addComment(newComment);
  }

  async _verifyParams(params) {
    const { threadId } = params;

    await this._threadRepository.checkAvailabilityThread(threadId);
  }
}

module.exports = AddCommentUseCase;
