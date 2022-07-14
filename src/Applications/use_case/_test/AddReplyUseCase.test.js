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
    const useCasePayload = {
      content: 'a reply',
    };
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const userId = 'user-123';
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
      userId,
      threadId,
      commentId,
      useCasePayload,
    );

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockThreadRepository.checkAvailabilityThread)
      .toBeCalledWith(threadId);
    expect(mockCommentRepository.checkAvailabilityComment)
      .toBeCalledWith(commentId);
    expect(mockReplyRepository.addReply)
      .toBeCalledWith(new NewReply({
        ...useCasePayload,
        commentId,
        owner: userId,
      }));
  });
});
