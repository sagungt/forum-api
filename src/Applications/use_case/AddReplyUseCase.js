const NewReply = require('../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({
    replyRepository,
    commentRepository,
    threadRepository,
  }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCaseParams, useCasePayload) {
    await this._verifyParams(useCaseParams);
    const { content } = useCasePayload;
    const { commentId } = useCaseParams;
    const date = new Date().toISOString();
    const newReply = new NewReply({
      commentId,
      content,
      date,
      owner: userId,
    });
    return this._replyRepository.addReply(newReply);
  }

  async _verifyParams(params) {
    const { threadId, commentId } = params;

    await this._threadRepository.checkAvailabilityThread(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId);
  }
}

module.exports = AddReplyUseCase;
