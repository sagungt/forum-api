class LikeUseCase {
  constructor({
    threadRepository,
    commentRepository,
    likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async toggleLike(threadId, commentId, userId) {
    await this._threadRepository.checkAvailabilityThread(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId);
    const isLiked = await this._likeRepository.isLiked(commentId, userId);
    if (isLiked) {
      await this._likeRepository.deleteLike(commentId, userId);
      return;
    }
    await this._likeRepository.addLike(commentId, userId);
  }
}

module.exports = LikeUseCase;
