const NewThread = require('../../Domains/threads/entities/NewThread');
const GetComment = require('../../Domains/comments/entities/GetComment');
const GetReply = require('../../Domains/replies/entities/GetReply');

class ThreadUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async addThread(useCasePayload) {
    const newThread = new NewThread({ ...useCasePayload });
    return this._threadRepository.addThread(newThread);
  }

  async getThreadDetail(threadId) {
    await this._threadRepository.checkAvailabilityThread(threadId);
    const getThread = await this._threadRepository.findThreadById(threadId);
    const comments = await this._commentRepository.findCommentsByThreadId(threadId);
    if (comments.length) {
      const commentsIds = comments.map((comment) => comment.id);
      const countLikes = await this._likeRepository.countCommentsLikes(commentsIds);
      const replies = await this._replyRepository
        .findRepliesByCommentIds(commentsIds);
      const replyIds = replies.map((reply) => reply.commentId);
      getThread.comments = comments.map((comment) => {
        const getComment = new GetComment(comment);
        getComment.likeCount = countLikes
          .filter(({ commentId }) => commentId === comment.id)
          .length;
        if (replyIds.includes(comment.id)) {
          getComment.replies = replies
            .filter((reply) => reply.commentId === comment.id)
            .map((reply) => ({ ...new GetReply(reply) }));
        }
        return { ...getComment };
      });
    }
    return { ...getThread };
  }
}

module.exports = ThreadUseCase;
