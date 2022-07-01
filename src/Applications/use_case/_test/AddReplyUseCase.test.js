const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddReplyUseCase = require('../AddReplyUseCase');
const NewReply = require('../../../Domains/replies/entities/NewReply');

jest.useFakeTimers();
describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const date = new Date().toISOString();
    const useCasePayload = {
      content: 'a reply',
    };
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
    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: 'a reply',
      owner: 'user-123',
    });

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.checkAvailabilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedReply));

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(
      useCaseAuth,
      useCaseParams,
      useCasePayload,
    );

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockThreadRepository.checkAvailabilityThread)
      .toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.checkAvailabilityComment)
      .toBeCalledWith(useCaseParams.commentId);
    expect(mockReplyRepository.addReply)
      .toBeCalledWith(new NewReply({
        ...useCasePayload,
        commentId: useCaseParams.commentId,
        date,
        owner: useCaseAuth.credentials.id,
      }));
  });
});
