const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const GetThread = require('../../Domains/threads/entities/GetThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread) {
    const {
      title,
      body,
      owner,
    } = newThread;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: `
        INSERT INTO
          threads(id, title, body, owner)
        VALUES($1, $2, $3, $4)
        RETURNING id, title, owner`,
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);

    return new AddedThread(result.rows[0]);
  }

  async findThreadById(id) {
    const query = {
      text: `
        SELECT
          t.id AS id,
          t.title AS title,
          t.body AS body,
          TO_CHAR(
            t.date::timestamp at time zone 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS"Z"'
          ) AS date,
          u.username AS username
        FROM
          threads t
        LEFT JOIN
          users u
        ON
          u.id = t.owner
        WHERE
          t.id = $1
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    return new GetThread(result.rows[0]);
  }

  async checkAvailabilityThread(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }
}

module.exports = ThreadRepositoryPostgres;
