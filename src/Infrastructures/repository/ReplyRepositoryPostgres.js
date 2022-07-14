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
      commentId, content, owner, isDeleted,
    } = newReply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: `
        INSERT INTO
        replies(id, comment_id, content, owner)
        VALUES($1, $2, $3, $4)
      RETURNING id, content, owner`,
      values: [id, commentId, content, owner],
    };

    const result = await this._pool.query(query);

    return new AddedReply(result.rows[0]);
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
          TO_CHAR(
            R.date::timestamp at time zone 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS"Z"'
          ) AS date,
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
