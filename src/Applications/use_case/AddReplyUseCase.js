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

  async execute(userId, threadId, commentId, useCasePayload) {
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
}

module.exports = AddReplyUseCase;
