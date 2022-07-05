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

  async execute(userId, threadId, commentId, replyId) {
    await this._threadRepository.checkAvailabilityThread(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId);
    await this._verifyOwner(userId, replyId);
    await this._replyRepository.softDeleteReplyById(replyId);
  }

  async _verifyOwner(userId, replyId) {
    const { owner } = await this._replyRepository.checkAvailabilityReply(replyId);

    if (userId !== owner) {
      throw new Error('DELETE_REPLY.INVALID_OWNERSHIP');
    }
  }
}

module.exports = DeleteReplyUseCase;
