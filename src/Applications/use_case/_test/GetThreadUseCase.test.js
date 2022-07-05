const GetThreadUseCase = require('../GetThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('GetThreadUseCase', () => {
  it('should return get thread without comment when no comments found', async () => {
    // Arrange
    const threadId = 'thread-123';
    const expedtedResut = {
      id: 'thread-123',
      title: 'a thread',
      body: 'thread content',
      date: 'now',
      username: 'dicoding',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.checkAvailabilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.findThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'a thread',
        body: 'thread content',
        date: 'now',
        username: 'dicoding',
      }));
    mockCommentRepository.findCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: {},
    });

    // Action
    const getThread = await getThreadUseCase.execute(threadId);

    // Assert
    expect(getThread).toStrictEqual(expedtedResut);
    expect(getThread.comments).not.toBeDefined();
  });

  it('should return get thread without reply when no replies found', async () => {
    // Arrange
    const threadId = 'thread-123';
    const expedtedResut = {
      id: 'thread-123',
      title: 'a thread',
      body: 'thread content',
      date: 'now',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: 'now',
          content: 'a comment 1',
        },
      ],
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.checkAvailabilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.findThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'a thread',
        body: 'thread content',
        date: 'now',
        username: 'dicoding',
      }));
    mockCommentRepository.findCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          username: 'dicoding',
          date: 'now',
          content: 'a comment 1',
          owner: 'user-123',
          isDeleted: false,
        },
      ]));
    mockReplyRepository.findRepliesByCommentIds = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'reply-1234',
          commentId: 'comment-1234',
          content: 'a reply 2',
          date: 'now',
          owner: 'user-123',
          username: 'dicoding',
          isDeleted: false,
        },
      ]));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const getThread = await getThreadUseCase.execute(threadId);

    // Assert
    expect(getThread).toStrictEqual(expedtedResut);
    expect(getThread.comments).toBeDefined();
    expect(getThread.comments[0].replies).not.toBeDefined();
  });

  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const expectedResult = {
      id: 'thread-123',
      title: 'a thread',
      body: 'thread content',
      date: 'now',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: 'now',
          content: 'a comment 1',
          replies: [
            {
              id: 'reply-123',
              content: 'a reply 1',
              date: 'now',
              username: 'dicoding',
            },
          ],
        },
        {
          id: 'comment-321',
          username: 'dicoding',
          date: 'now',
          content: '**komentar telah dihapus**',
          replies: [
            {
              id: 'reply-321',
              content: '**balasan telah dihapus**',
              date: 'now',
              username: 'dicoding',
            },
          ],
        },
      ],
    };
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.checkAvailabilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.findThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'a thread',
        body: 'thread content',
        date: 'now',
        username: 'dicoding',
      }));
    mockCommentRepository.findCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          username: 'dicoding',
          date: 'now',
          content: 'a comment 1',
          isDeleted: false,
        },
        {
          id: 'comment-321',
          username: 'dicoding',
          date: 'now',
          content: 'a comment 2',
          isDeleted: true,
        },
      ]));
    mockReplyRepository.findRepliesByCommentIds = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'reply-123',
          commentId: 'comment-123',
          content: 'a reply 1',
          date: 'now',
          username: 'dicoding',
          isDeleted: false,
        },
        {
          id: 'reply-321',
          commentId: 'comment-321',
          content: 'a reply 2',
          date: 'now',
          username: 'dicoding',
          isDeleted: true,
        },
      ]));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const getThread = await getThreadUseCase.execute(threadId);

    // Arrange
    expect(getThread).toStrictEqual(expectedResult);
    expect(mockThreadRepository.checkAvailabilityThread)
      .toBeCalledWith('thread-123');
    expect(mockThreadRepository.findThreadById)
      .toBeCalledWith('thread-123');
    expect(mockCommentRepository.findCommentsByThreadId)
      .toBeCalledWith('thread-123');
    expect(mockReplyRepository.findRepliesByCommentIds)
      .toBeCalledWith(['comment-123', 'comment-321']);
  });
});
