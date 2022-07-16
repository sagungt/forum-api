const NewReply = require('../../Domains/replies/entities/NewReply');

class ReplyUseCase {
  constructor({
    replyRepository,
    commentRepository,
    threadRepository,
  }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async addReply(userId, threadId, commentId, useCasePayload) {
    await this._threadRepository.checkAvailabilityThread(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId);
    const { content } = useCasePayload;
    const newReply = new NewReply({
      commentId,
      content,
      owner: userId,
    });
    return this._replyRepository.addReply(newReply);
  }

  async deleteReply(userId, threadId, commentId, replyId) {
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

module.exports = ReplyUseCase;
