const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentUseCase = require('../CommentUseCase');

describe('CommentUseCase', () => {
  let mockCommentRepository;
  let mockThreadRepository;
  beforeEach(() => {
    mockCommentRepository = new CommentRepository();
    mockThreadRepository = new ThreadRepository();
  });

  describe('addComment action', () => {
    it('should orchestrating the add comment action correctly', async () => {
      // Arrange
      const useCasePayload = {
        content: 'a comment',
      };
      const threadId = 'thread-123';
      const userId = 'user-123';
      const expectedAddedComment = new AddedComment({
        id: 'comment-123',
        content: 'a comment',
        owner: 'user-123',
      });

      mockCommentRepository.addComment = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedAddedComment));
      mockThreadRepository.checkAvailabilityThread = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const commentUseCase = new CommentUseCase({
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action
      const addedComment = await commentUseCase
        .addComment(userId, threadId, useCasePayload);

      // Assert
      expect(addedComment).toStrictEqual(expectedAddedComment);
      expect(mockThreadRepository.checkAvailabilityThread)
        .toBeCalledWith(threadId);
      expect(mockCommentRepository.addComment)
        .toBeCalledWith(new NewComment({
          ...useCasePayload,
          threadId,
          owner: userId,
        }));
    });
  });

  describe('deleteComment action', () => {
    it('should throw error if user id and comment owner not match', async () => {
      // Arrange
      const userId = 'user-123';

      mockCommentRepository.softDeleteCommentById = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.checkAvailabilityComment = jest.fn()
        .mockImplementation(() => Promise.resolve({ owner: 'user-321' }));
      mockThreadRepository.checkAvailabilityThread = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const commentUseCase = new CommentUseCase({
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action & Assert
      await expect(commentUseCase.deleteComment(userId, {}))
        .rejects.toThrowError('DELETE_COMMENT.INVALID_OWNERSHIP');
    });

    it('should orchestrating the delete comment action correctly', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const userId = 'user-123';

      mockCommentRepository.softDeleteCommentById = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.checkAvailabilityComment = jest.fn()
        .mockImplementation(() => Promise.resolve({ owner: 'user-123' }));
      mockThreadRepository.checkAvailabilityThread = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const commentUseCase = new CommentUseCase({
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action
      await commentUseCase.deleteComment(userId, threadId, commentId);

      // Assert
      expect(mockThreadRepository.checkAvailabilityThread)
        .toHaveBeenCalledWith(threadId);
      expect(mockCommentRepository.checkAvailabilityComment)
        .toHaveBeenCalledWith(commentId);
      expect(mockCommentRepository.softDeleteCommentById)
        .toHaveBeenCalledWith(commentId);
    });
  });
});
