const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const GetThread = require('../../../Domains/threads/entities/GetThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add new thread and return added thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'a thread',
        body: 'thread content',
        date: new Date().toISOString(),
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await threadRepositoryPostgres.addThread(newThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'a thread',
        body: 'thread content',
        date: new Date().toISOString(),
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'a thread',
        owner: 'user-123',
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should throw InvariantError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.findThreadById('thread-123'))
        .rejects.toThrowError(InvariantError);
    });

    it('should return correct thread data when thread is found', async () => {
      // Arrange
      const date = new Date().toISOString();
      const newThread = new NewThread({
        title: 'a thread',
        body: 'thread content',
        date,
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await threadRepositoryPostgres.addThread(newThread);
      const getThread = await threadRepositoryPostgres.findThreadById('thread-123');

      // Assert
      expect(getThread).toBeInstanceOf(GetThread);
      expect(getThread).toStrictEqual(new GetThread({
        id: 'thread-123',
        title: 'a thread',
        body: 'thread content',
        date,
        username: 'dicoding',
      }));
    });
  });

  describe('verifyAvailability function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.checkAvailabilityThread('non-thread-id'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw error when thread is found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await expect(threadRepositoryPostgres.checkAvailabilityThread('thread-123'))
        .resolves.not.toThrowError();
    });
  });
});
