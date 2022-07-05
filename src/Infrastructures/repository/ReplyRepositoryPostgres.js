const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const {
      commentId, content, date, owner, isDeleted,
    } = newReply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, commentId, content, date, owner, isDeleted],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async checkAvailabilityReply(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }

    return result.rows[0];
  }

  async softDeleteReplyById(id) {
    const query = {
      text: 'UPDATE replies SET is_deleted = $1 WHERE id = $2',
      values: [true, id],
    };

    await this._pool.query(query);
  }

  async findRepliesByCommentIds(commentIds) {
    const query = {
      text: `
        SELECT
          R.id AS id,
          R.content AS content,
          R.date AS date,
          U.username AS username,
          R.comment_id AS "commentId",
          R.is_deleted AS "isDeleted"
        FROM
          replies R
        INNER JOIN
          users U
        ON
          R.owner = U.id
        WHERE
          R.comment_id = ANY($1::text[])
        ORDER BY
          R.date
        ASC
      `,
      values: [commentIds],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;
