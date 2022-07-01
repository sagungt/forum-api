const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const useCaseAuth = {
      credentials: {
        id: 'user-123',
        username: 'dicoding',
      },
    };
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
    await deleteCommentUseCase.execute(useCaseParams, useCaseAuth);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread)
      .toHaveBeenCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.checkAvailabilityComment)
      .toHaveBeenCalledWith(useCaseParams.commentId);
    expect(mockCommentRepository.softDeleteCommentById)
      .toHaveBeenCalledWith(useCaseParams.commentId);
  });
});
