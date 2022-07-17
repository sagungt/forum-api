const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const LikeUseCase = require('../LikeUseCase');

describe('LikeUseCase', () => {
  let mockThreadRepository;
  let mockCommentRepository;
  let mockLikeRepository;
  beforeEach(() => {
    mockThreadRepository = new ThreadRepository();
    mockCommentRepository = new CommentRepository();
    mockLikeRepository = new LikeRepository();
  });

  describe('toggleLike action', () => {
    it('should orchestrating the toggle like action correctly', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'commentId';
      const userId = 'user-123';
      mockThreadRepository.checkAvailabilityThread = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.checkAvailabilityComment = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockLikeRepository.isLiked = jest.fn()
        .mockImplementation(() => Promise.resolve(false));
      mockLikeRepository.addLike = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const likeUseCase = new LikeUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        likeRepository: mockLikeRepository,
      });

      // Action
      await likeUseCase.toggleLike(threadId, commentId, userId);

      // Assert
      expect(mockThreadRepository.checkAvailabilityThread)
        .toBeCalledWith(threadId);
      expect(mockCommentRepository.checkAvailabilityComment)
        .toBeCalledWith(commentId);
      expect(mockLikeRepository.isLiked)
        .toBeCalledWith(commentId, userId);
      expect(mockLikeRepository.addLike)
        .toBeCalledWith(commentId, userId);
    });

    it('should orchestrating the toggle dislike when comment already liked action correctly', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'commentId';
      const userId = 'user-123';
      mockThreadRepository.checkAvailabilityThread = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.checkAvailabilityComment = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockLikeRepository.isLiked = jest.fn()
        .mockImplementation(() => Promise.resolve(true));
      mockLikeRepository.deleteLike = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const likeUseCase = new LikeUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        likeRepository: mockLikeRepository,
      });

      // Action
      await likeUseCase.toggleLike(threadId, commentId, userId);

      // Assert
      expect(mockThreadRepository.checkAvailabilityThread)
        .toBeCalledWith(threadId);
      expect(mockCommentRepository.checkAvailabilityComment)
        .toBeCalledWith(commentId);
      expect(mockLikeRepository.isLiked)
        .toBeCalledWith(commentId, userId);
      expect(mockLikeRepository.deleteLike)
        .toBeCalledWith(commentId, userId);
    });
  });
});
