const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteCommentUseCase', () => {
  it('should throw error if user id and comment owner not match', async () => {
    // Arrange
    const userId = 'user-123';

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    mockCommentRepository.softDeleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = jest.fn()
      .mockImplementation(() => Promise.resolve({ owner: 'user-321' }));
    mockThreadRepository.checkAvailabilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(userId, {}))
      .rejects.toThrowError('DELETE_COMMENT.INVALID_OWNERSHIP');
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const userId = 'user-123';
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    mockCommentRepository.softDeleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = jest.fn()
      .mockImplementation(() => Promise.resolve({ owner: 'user-123' }));
    mockThreadRepository.checkAvailabilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute(userId, useCaseParams);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread)
      .toHaveBeenCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.checkAvailabilityComment)
      .toHaveBeenCalledWith(useCaseParams.commentId);
    expect(mockCommentRepository.softDeleteCommentById)
      .toHaveBeenCalledWith(useCaseParams.commentId);
  });
});
