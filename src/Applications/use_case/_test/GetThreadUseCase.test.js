const GetThreadUseCase = require('../GetThreadUseCase');
const GetThread = require('../../../Domains/threads/entities/GetThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
    };
    const expectedGetThread = new GetThread({
      id: 'thread-123',
      title: 'a thread',
      body: 'thread content',
      date: 'now',
      username: 'dicoding',
    });
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.checkAvailabilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.findThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedGetThread));
    mockCommentRepository.findCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));
    mockReplyRepository.findRepliesByCommentIds = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const getThread = await getThreadUseCase.execute(useCaseParams);

    // Arrange
    expect(getThread).toStrictEqual(expectedGetThread);
    expect(mockThreadRepository.checkAvailabilityThread)
      .toBeCalledWith(useCaseParams.threadId);
    expect(mockThreadRepository.findThreadById)
      .toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.findCommentsByThreadId)
      .toBeCalledWith(useCaseParams.threadId);
    expect(mockReplyRepository.findRepliesByCommentIds)
      .toBeCalledTimes(1);
  });
});
