const GetThreadUseCase = require('../GetThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetComment = require('../../../Domains/comments/entities/GetComment');
const GetReply = require('../../../Domains/replies/entities/GetReply');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
    };
    const expectedGetThread = {
      id: 'thread-123',
      title: 'a thread',
      body: 'thread content',
      date: 'now',
      username: 'dicoding',
    };
    const expectedComments = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: 'now',
        content: 'a comment 1',
        owner: 'user-123',
        is_deleted: false,
      },
      {
        id: 'comment-1234',
        username: 'dicoding',
        date: 'now',
        content: 'a comment 2',
        owner: 'user-123',
        is_deleted: true,
      },
    ];
    const expectedReplies = [
      {
        id: 'reply-123',
        comment_id: 'comment-123',
        content: 'a reply 1',
        date: 'now',
        owner: 'user-123',
        username: 'dicoding',
        is_deleted: false,
      },
      {
        id: 'reply-1234',
        comment_id: 'comment-1234',
        content: 'a reply 2',
        date: 'now',
        owner: 'user-123',
        username: 'dicoding',
        is_deleted: true,
      },
    ];
    const repliesInComment = (comments, replies) => comments.map((comment) => {
      const getComment = new GetComment({
        ...comment,
        content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
      });
      if (replies.map((reply) => reply.comment_id).includes(comment.id)) {
        getComment.replies = replies
          .filter((reply) => comment.id === reply.comment_id)
          .map((reply) => new GetReply({
            ...reply,
            content: reply.is_deleted ? '**balasan telah dihapus**' : reply.content,
          }));
      }
      return getComment;
    });
    const expectedResults = {
      ...expectedGetThread,
      comments: repliesInComment(expectedComments, expectedReplies),
    };
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.checkAvailabilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.findThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedGetThread));
    mockCommentRepository.findCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));
    mockReplyRepository.findRepliesByCommentIds = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedReplies));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const getThread = await getThreadUseCase.execute(useCaseParams);

    // Arrange
    expect(getThread).toStrictEqual(expectedResults);
    expect(mockThreadRepository.checkAvailabilityThread)
      .toBeCalledWith(useCaseParams.threadId);
    expect(mockThreadRepository.findThreadById)
      .toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.findCommentsByThreadId)
      .toBeCalledWith(useCaseParams.threadId);
    expect(mockReplyRepository.findRepliesByCommentIds)
      .toBeCalledWith(['comment-123', 'comment-1234']);
  });
});
