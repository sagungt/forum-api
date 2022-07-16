const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const ReplyUseCase = require('../ReplyUseCase');

describe('ReplyUseCase', () => {
  let mockReplyRepository;
  let mockCommentRepository;
  let mockThreadRepository;
  beforeEach(() => {
    mockReplyRepository = new ReplyRepository();
    mockCommentRepository = new CommentRepository();
    mockThreadRepository = new ThreadRepository();
  });
  describe('addReply action', () => {
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

      mockThreadRepository.checkAvailabilityThread = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.checkAvailabilityComment = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockReplyRepository.addReply = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedAddedReply));

      const replyUseCase = new ReplyUseCase({
        replyRepository: mockReplyRepository,
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action
      const addedReply = await replyUseCase.addReply(
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

  describe('deleteReply action', () => {
    let threadId;
    let commentId;
    let replyId;
    let userId;
    beforeEach(() => {
      threadId = 'thread-123';
      commentId = 'comment-123';
      replyId = 'reply-123';
      userId = 'user-123';
    });
    it('should throw error if user id and reply owner not match', async () => {
      // Arrange
      mockThreadRepository.checkAvailabilityThread = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.checkAvailabilityComment = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockReplyRepository.checkAvailabilityReply = jest.fn()
        .mockImplementation(() => Promise.resolve({ owner: 'user-321' }));
      mockReplyRepository.softDeleteReplyById = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const replyUseCase = new ReplyUseCase({
        replyRepository: mockReplyRepository,
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action & Assert
      await expect(replyUseCase.deleteReply(userId, threadId, commentId, replyId))
        .rejects.toThrowError('DELETE_REPLY.INVALID_OWNERSHIP');
    });

    it('should orchestrating the delete reply action correctly', async () => {
      // Arrange
      mockThreadRepository.checkAvailabilityThread = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.checkAvailabilityComment = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockReplyRepository.checkAvailabilityReply = jest.fn()
        .mockImplementation(() => Promise.resolve({ owner: 'user-123' }));
      mockReplyRepository.softDeleteReplyById = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const replyUseCase = new ReplyUseCase({
        replyRepository: mockReplyRepository,
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action
      await replyUseCase.deleteReply(userId, threadId, commentId, replyId);

      // Assert
      expect(mockThreadRepository.checkAvailabilityThread)
        .toBeCalledWith(threadId);
      expect(mockCommentRepository.checkAvailabilityComment)
        .toBeCalledWith(commentId);
      expect(mockReplyRepository.checkAvailabilityReply)
        .toBeCalledWith(replyId);
      expect(mockReplyRepository.softDeleteReplyById)
        .toBeCalledWith(replyId);
    });
  });
});
