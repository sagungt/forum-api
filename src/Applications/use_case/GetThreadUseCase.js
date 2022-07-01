const GetComment = require('../../Domains/comments/entities/GetComment');
const GetReply = require('../../Domains/replies/entities/GetReply');

class GetThreadUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParams) {
    await this._verifyParams(useCaseParams);
    const { threadId } = useCaseParams;
    const getThread = await this._threadRepository.findThreadById(threadId);
    const comments = await this._commentRepository.findCommentsByThreadId(threadId);
    if (comments.length) {
      const replies = await this._replyRepository
        .findRepliesByCommentIds(comments.map((comment) => comment.id));
      const replyIds = replies.map((reply) => reply.comment_id);
      getThread.comments = comments.map((comment) => {
        const getComment = new GetComment({
          ...comment,
          content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
        });
        if (replyIds.includes(comment.id)) {
          getComment.replies = replies
            .filter((reply) => reply.comment_id === comment.id)
            .map((reply) => new GetReply({
              ...reply,
              content: reply.is_deleted ? '**balasan telah dihapus**' : reply.content,
            }));
        }
        return getComment;
      });
    }
    return getThread;
  }

  async _verifyParams(params) {
    const { threadId } = params;

    await this._threadRepository.checkAvailabilityThread(threadId);
  }
}

module.exports = GetThreadUseCase;
