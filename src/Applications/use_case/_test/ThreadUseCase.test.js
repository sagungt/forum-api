const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ThreadUseCase = require('../ThreadUseCase');

describe('ThreadUseCase', () => {
  let mockThreadRepository;
  let mockCommentRepository;
  let mockReplyRepository;
  let mockLikeRepository;
  beforeEach(() => {
    mockThreadRepository = new ThreadRepository();
    mockCommentRepository = new CommentRepository();
    mockReplyRepository = new ReplyRepository();
    mockLikeRepository = new LikeRepository();
  });
  describe('addThread action', () => {
    it('it should orchestrating the add thread action correctly', async () => {
      // Arrange
      const useCasePayload = {
        title: 'a thread',
        body: 'thread description',
        owner: 'user-123',
      };
      const expectedAddedThread = new AddedThread({
        id: 'thread-123',
        title: 'a thread',
        owner: 'user-123',
      });

      mockThreadRepository.addThread = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedAddedThread));

      const threadUseCase = new ThreadUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: {},
        replyRepository: {},
        likeRepository: {},
      });

      // Action
      const addedThread = await threadUseCase.addThread(useCasePayload);

      // Assert
      expect(addedThread).toStrictEqual(expectedAddedThread);
      expect(mockThreadRepository.addThread)
        .toBeCalledWith(new NewThread({ ...useCasePayload }));
    });
  });

  describe('GetThreadUseCase', () => {
    it('should return get thread without comment when no comments found', async () => {
      // Arrange
      const threadId = 'thread-123';
      const expedtedResut = {
        id: 'thread-123',
        title: 'a thread',
        body: 'thread content',
        date: new Date('2022-07-14').toISOString(),
        username: 'dicoding',
      };

      mockThreadRepository.checkAvailabilityThread = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockThreadRepository.findThreadById = jest.fn()
        .mockImplementation(() => Promise.resolve({
          id: 'thread-123',
          title: 'a thread',
          body: 'thread content',
          date: new Date('2022-07-14').toISOString(),
          username: 'dicoding',
        }));
      mockCommentRepository.findCommentsByThreadId = jest.fn()
        .mockImplementation(() => Promise.resolve([]));

      const threadUseCase = new ThreadUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: {},
        likeRepository: {},
      });

      // Action
      const getThread = await threadUseCase.getThreadDetail(threadId);

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
        date: new Date('2022-07-14').toISOString(),
        username: 'dicoding',
        comments: [
          {
            id: 'comment-123',
            username: 'dicoding',
            date: new Date('2022-07-14').toISOString(),
            content: 'a comment 1',
            likeCount: 0,
          },
        ],
      };

      mockThreadRepository.checkAvailabilityThread = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockThreadRepository.findThreadById = jest.fn()
        .mockImplementation(() => Promise.resolve({
          id: 'thread-123',
          title: 'a thread',
          body: 'thread content',
          date: new Date('2022-07-14').toISOString(),
          username: 'dicoding',
        }));
      mockCommentRepository.findCommentsByThreadId = jest.fn()
        .mockImplementation(() => Promise.resolve([
          {
            id: 'comment-123',
            username: 'dicoding',
            date: new Date('2022-07-14').toISOString(),
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
            date: new Date('2022-07-14').toISOString(),
            owner: 'user-123',
            username: 'dicoding',
            isDeleted: false,
          },
        ]));
      mockLikeRepository.countCommentsLikes = jest.fn()
        .mockImplementation(() => Promise.resolve([]));

      const threadUseCase = new ThreadUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
        likeRepository: mockLikeRepository,
      });

      // Action
      const getThread = await threadUseCase.getThreadDetail(threadId);

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
        date: new Date('2022-07-14').toISOString(),
        username: 'dicoding',
        comments: [
          {
            id: 'comment-123',
            username: 'dicoding',
            date: new Date('2022-07-14').toISOString(),
            content: 'a comment 1',
            likeCount: 2,
            replies: [
              {
                id: 'reply-123',
                content: 'a reply 1',
                date: new Date('2022-07-14').toISOString(),
                username: 'dicoding',
              },
            ],
          },
          {
            id: 'comment-321',
            username: 'dicoding',
            date: new Date('2022-07-14').toISOString(),
            content: '**komentar telah dihapus**',
            likeCount: 0,
            replies: [
              {
                id: 'reply-321',
                content: '**balasan telah dihapus**',
                date: new Date('2022-07-14').toISOString(),
                username: 'dicoding',
              },
            ],
          },
        ],
      };

      mockThreadRepository.checkAvailabilityThread = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockThreadRepository.findThreadById = jest.fn()
        .mockImplementation(() => Promise.resolve({
          id: 'thread-123',
          title: 'a thread',
          body: 'thread content',
          date: new Date('2022-07-14').toISOString(),
          username: 'dicoding',
        }));
      mockCommentRepository.findCommentsByThreadId = jest.fn()
        .mockImplementation(() => Promise.resolve([
          {
            id: 'comment-123',
            username: 'dicoding',
            date: new Date('2022-07-14').toISOString(),
            content: 'a comment 1',
            isDeleted: false,
          },
          {
            id: 'comment-321',
            username: 'dicoding',
            date: new Date('2022-07-14').toISOString(),
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
            date: new Date('2022-07-14').toISOString(),
            username: 'dicoding',
            isDeleted: false,
          },
          {
            id: 'reply-321',
            commentId: 'comment-321',
            content: 'a reply 2',
            date: new Date('2022-07-14').toISOString(),
            username: 'dicoding',
            isDeleted: true,
          },
        ]));
      mockLikeRepository.countCommentsLikes = jest.fn()
        .mockImplementation(() => Promise.resolve([
          {
            id: 'like-123',
            commentId: 'comment-123',
            userId: 'user-123',
          },
          {
            id: 'like-321',
            commentId: 'comment-123',
            userId: 'user-321',
          },
        ]));

      const threadUseCase = new ThreadUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
        likeRepository: mockLikeRepository,
      });

      // Action
      const getThread = await threadUseCase.getThreadDetail(threadId);

      // Arrange
      expect(getThread).toStrictEqual(expectedResult);
      expect(mockThreadRepository.checkAvailabilityThread)
        .toBeCalledWith('thread-123');
      expect(mockThreadRepository.findThreadById)
        .toBeCalledWith('thread-123');
      expect(mockCommentRepository.findCommentsByThreadId)
        .toBeCalledWith('thread-123');
      expect(mockLikeRepository.countCommentsLikes)
        .toBeCalledWith(['comment-123', 'comment-321']);
      expect(mockReplyRepository.findRepliesByCommentIds)
        .toBeCalledWith(['comment-123', 'comment-321']);
    });
  });
});
