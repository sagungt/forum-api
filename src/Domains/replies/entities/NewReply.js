class NewReply {
  constructor(payload) {
    this._verifyPayload(payload);
    const {
      content, commentId, date, owner,
    } = payload;

    this.content = content;
    this.commentId = commentId;
    this.date = date;
    this.owner = owner;
    this.isDeleted = false;
  }

  _verifyPayload(payload) {
    const {
      content, commentId, date, owner,
    } = payload;

    if (
      !content
      || !commentId
      || !date
      || !owner
    ) {
      throw new Error('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof content !== 'string'
      || typeof commentId !== 'string'
      || typeof date !== 'string'
      || typeof owner !== 'string'
    ) {
      throw new Error('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewReply;
