const ReplyUseCase = require('../../../../Applications/use_case/ReplyUseCase');

class ReplyHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    const addedReply = await replyUseCase.addReply(
      userId,
      threadId,
      commentId,
      request.payload,
    );

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;
    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    await replyUseCase.deleteReply(userId, threadId, commentId, replyId);
    return {
      status: 'success',
    };
  }
}

module.exports = ReplyHandler;
