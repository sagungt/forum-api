class ReplyRepository {
  async addReply(newReply) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async findRepliesByCommentIds(commentIds) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async softDeleteReplyById(id) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async checkAvailabilityReply(id) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = ReplyRepository;
