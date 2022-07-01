const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };
    const useCaseAuth = {
      credentials: {
        id: 'user-123',
        username: 'dicoding',
      },
    };
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.checkAvailabilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.checkAvailabilityReply = jest.fn()
      .mockImplementation(() => Promise.resolve({ owner: 'user-123' }));
    mockReplyRepository.softDeleteReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteReplyUseCase.execute(useCaseAuth, useCaseParams);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread)
      .toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.checkAvailabilityComment)
      .toBeCalledWith(useCaseParams.commentId);
    expect(mockReplyRepository.checkAvailabilityReply)
      .toBeCalledWith(useCaseParams.replyId);
    expect(mockReplyRepository.softDeleteReplyById)
      .toBeCalledWith(useCaseParams.replyId);
  });
});
