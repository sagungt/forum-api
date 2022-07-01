class DeleteReplyUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseAuth, useCaseParams) {
    await this._verifyParams(useCaseParams);
    const { replyId } = useCaseParams;
    const { id: userId } = useCaseAuth.credentials;
    await this._verifyOwner(userId, replyId);
    await this._replyRepository.softDeleteReplyById(replyId);
  }

  async _verifyParams(params) {
    const { threadId, commentId } = params;

    await this._threadRepository.checkAvailabilityThread(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId);
  }

  async _verifyOwner(userId, replyId) {
    const { owner } = await this._replyRepository.checkAvailabilityReply(replyId);

    if (userId !== owner) {
      throw new Error('DELETE_REPLY.INVALID_OWNERSHIP');
    }
  }
}

module.exports = DeleteReplyUseCase;
