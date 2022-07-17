const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const pool = require('../../database/postgres/pool');

describe('LikeRepositoryPostgres', () => {
  const threadId = 'thread-123';
  const commentId = 'comment-123';
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding1' });
    await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding2' });
    await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'dicoding3' });
    await ThreadsTableTestHelper.addThread({ id: threadId, owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: commentId, owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-1234', owner: 'user-123' });
  });

  describe('addLike function', () => {
    it('should persist liked comment', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike(commentId, 'user-123');

      // Arrange
      const likes = await LikesTableTestHelper.findLikes(commentId);
      const count = await LikesTableTestHelper.countCommentLikes(commentId);
      expect(count).toEqual(1);
      expect(likes[0].userId).toEqual('user-123');
    });
  });

  describe('deleteLike function', () => {
    it('should persist delete liked comment', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      await LikesTableTestHelper.addLike('like-123', commentId, 'user-123');
      await LikesTableTestHelper.addLike('like-1234', commentId, 'user-1234');
      await LikesTableTestHelper.addLike('like-12345', commentId, 'user-12345');

      // Action
      await likeRepositoryPostgres.deleteLike(commentId, 'user-12345');

      // Arrange
      const likes = await LikesTableTestHelper.findLikes(commentId);
      const count = await LikesTableTestHelper.countCommentLikes(commentId);
      expect(count).toEqual(2);
      expect(likes[0].userId).toEqual('user-123');
      expect(likes[1].userId).toEqual('user-1234');
    });
  });

  describe('isLiked function', () => {
    it('should return true if comment is liked', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      await LikesTableTestHelper.addLike('like-123', commentId, 'user-123');

      // Action
      const isLiked = await likeRepositoryPostgres.isLiked(commentId, 'user-123');

      // Arrange
      expect(isLiked).toEqual(true);
    });

    it('should return false if comment is liked', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      await LikesTableTestHelper.addLike('like-123', commentId, 'user-1234');

      // Action
      const isLiked = await likeRepositoryPostgres.isLiked(commentId, 'user-123');

      // Arrange
      expect(isLiked).toEqual(false);
    });
  });

  describe('countCommentLikes function', () => {
    it('should return 4 of 2 comments is liked by 2 user', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      await LikesTableTestHelper.addLike('like-123', commentId, 'user-123');
      await LikesTableTestHelper.addLike('like-1234', commentId, 'user-1234');
      await LikesTableTestHelper.addLike('like-12345', 'comment-1234', 'user-123');
      await LikesTableTestHelper.addLike('like-123456', 'comment-1234', 'user-1234');

      // Action
      const count = await likeRepositoryPostgres.countCommentsLikes([commentId, 'comment-1234']);

      // Arrange
      expect(count).toHaveLength(4);
      expect(count).toStrictEqual([
        {
          id: 'like-123',
          commentId,
          userId: 'user-123',
        },
        {
          id: 'like-1234',
          commentId,
          userId: 'user-1234',
        },
        {
          id: 'like-12345',
          commentId: 'comment-1234',
          userId: 'user-123',
        },
        {
          id: 'like-123456',
          commentId: 'comment-1234',
          userId: 'user-1234',
        },
      ]);
    });
  });

  it('should return 0 if there is no one liked', async () => {
    // Arrange
    const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

    // Action
    const count = await likeRepositoryPostgres.countCommentsLikes([commentId]);

    // Assert
    expect(count).toHaveLength(0);
  });
});
