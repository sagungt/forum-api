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

  async execute(useCaseAuth, useCaseParams, useCasePayload) {
    await this._verifyParams(useCaseParams);
    this._verifyPayload(useCasePayload);
    const { content } = useCasePayload;
    const { commentId } = useCaseParams;
    const { id: owner } = useCaseAuth.credentials;
    const date = new Date().toISOString();
    const newReply = new NewReply({
      commentId,
      content,
      date,
      owner,
    });
    return this._replyRepository.addReply(newReply);
  }

  async _verifyParams(params) {
    const { threadId, commentId } = params;

    await this._threadRepository.checkAvailabilityThread(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId);
  }

  _verifyPayload(payload) {
    const { content } = payload;

    if (!content) {
      throw new Error('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string') {
      throw new Error('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddReplyUseCase;
