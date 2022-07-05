class DeleteCommentUseCase {
  constructor({
    commentRepository,
    threadRepository,
  }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCaseParams) {
    await this._verifyParams(useCaseParams);
    const { commentId } = useCaseParams;
    await this._verifyOwner(userId, commentId);
    await this._commentRepository.softDeleteCommentById(commentId);
  }

  async _verifyParams(params) {
    const { threadId } = params;

    await this._threadRepository.checkAvailabilityThread(threadId);
  }

  async _verifyOwner(userId, commentId) {
    const { owner } = await this._commentRepository
      .checkAvailabilityComment(commentId);

    if (userId !== owner) {
      throw new Error('DELETE_COMMENT.INVALID_OWNERSHIP');
    }
  }
}

module.exports = DeleteCommentUseCase;
