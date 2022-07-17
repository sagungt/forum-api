const LikeUseCase = require('../../../../Applications/use_case/LikeUseCase');

class LikeHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request) {
    const { threadId, commentId } = request.params;
    const { id: userId } = request.auth.credentials;
    const likeUseCase = this._container.getInstance(LikeUseCase.name);
    await likeUseCase.toggleLike(threadId, commentId, userId);

    return {
      status: 'success',
    };
  }
}

module.exports = LikeHandler;
