const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { content, threadId, owner } = newComment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: `
        INSERT INTO
          comments(id, thread_id, content, owner)
          VALUES($1, $2, $3, $4)
        RETURNING id, content, owner`,
      values: [id, threadId, content, owner],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async checkAvailabilityComment(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }

    return result.rows[0];
  }

  async softDeleteCommentById(id) {
    const query = {
      text: 'UPDATE comments SET is_deleted = $1 WHERE id = $2',
      values: [true, id],
    };

    await this._pool.query(query);
  }

  async findCommentsByThreadId(id) {
    const query = {
      text: `
        SELECT
          C.id AS id,
          U.username AS username,
          TO_CHAR(
            C.date::timestamp at time zone 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS"Z"'
          ) AS date,
          C.content AS content,
          C.is_deleted AS "isDeleted"
        FROM
          comments C
        INNER JOIN
          users U
        ON
          C.owner = U.id
        WHERE
          C.thread_id = $1
        ORDER BY
          C.date ASC
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;
