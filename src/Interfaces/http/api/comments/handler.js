const CommentUseCase = require('../../../../Applications/use_case/CommentUseCase');

class CommentHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId } = request.params;
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    const addedComment = await commentUseCase.addComment(
      userId,
      threadId,
      request.payload,
    );

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    await commentUseCase.deleteComment(userId, threadId, commentId);
    return {
      status: 'success',
    };
  }
}

module.exports = CommentHandler;
