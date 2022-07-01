const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository interface', () => {
  it('should throw error when invoke unimplemented method', async () => {
    // Arrange
    const replyRepository = new ReplyRepository();

    // Action & Assert
    await expect(replyRepository.addReply({})).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyRepository.findRepliesByCommentIds('')).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyRepository.softDeleteReplyById('')).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyRepository.checkAvailabilityReply('')).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
