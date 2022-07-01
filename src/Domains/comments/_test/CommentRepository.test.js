const CommentRepository = require('../CommentRepository');

describe('CommentRepository interface', () => {
  it('should throw error when invoke unimplemented method', async () => {
    // Arrange
    const commentRepository = new CommentRepository();

    // Action & Assert
    await expect(commentRepository.addComment({})).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.findCommentsByThreadId('')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.softDeleteCommentById('')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.checkAvailabilityComment('')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
