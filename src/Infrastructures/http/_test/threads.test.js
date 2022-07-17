const pool = require('../../database/postgres/pool');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const createServer = require('../createServer');
const container = require('../../container');

describe('/threads endpoint', () => {
  let server;
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  beforeAll(async () => {
    server = await createServer(container);
  });

  const addUserAndLogin = async ({
    username = 'dicoding',
    password = 'secret',
    fullname = 'Dicoding Indonesia',
  } = {}) => {
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username,
        password,
        fullname,
      },
    });
    const authenticationResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username,
        password,
      },
    });
    const authenticationResponseJson = JSON.parse(authenticationResponse.payload);
    const { accessToken } = authenticationResponseJson.data;
    return accessToken;
  };

  const addThread = async (accessToken) => {
    const threadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      payload: {
        title: 'a thread',
        body: 'thread content',
      },
    });
    const threadResponseJson = JSON.parse(threadResponse.payload);
    const { id } = threadResponseJson.data.addedThread;
    return id;
  };

  const addComment = async (accessToken, threadId) => {
    const newComment = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      payload: {
        content: 'a comment',
      },
    });
    const newCommentJson = JSON.parse(newComment.payload);
    const { id } = newCommentJson.data.addedComment;
    return id;
  };

  const addReply = async (accessToken, threadId, commentId) => {
    const replyResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      payload: {
        content: 'a reply',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const replyResponseJson = JSON.parse(replyResponse.payload);
    const { id } = replyResponseJson.data.addedReply;
    return id;
  };

  const deleteComment = async (accessToken, threadId, commentId) => {
    await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  };

  const deleteReply = async (accessToken, threadId, commentId, replyId) => {
    await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  };

  const toggleLikeComment = async (accessToken, threadId, commentId) => {
    await server.inject({
      method: 'PUT',
      url: `/threads/${threadId}/comments/${commentId}/likes`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  };

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'a thread',
        body: 'thread content',
      };

      const accessToken = await addUserAndLogin();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 401 when headers authentication token incorrect', async () => {
      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'a thread',
      };
      const accessToken = await addUserAndLogin();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 123,
        body: 'thread content',
      };

      const accessToken = await addUserAndLogin();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 with correct value without comments', async () => {
      const accessToken = await addUserAndLogin();
      const threadId = await addThread(accessToken);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.id).toEqual(threadId);
      expect(responseJson.data.thread.comments).not.toBeDefined();
    });

    it('should response 200 with correct value without replies', async () => {
      const accessToken = await addUserAndLogin();
      const threadId = await addThread(accessToken);
      const commentId = await addComment(accessToken, threadId);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.comments[0].id).toEqual(commentId);
      expect(responseJson.data.thread.comments[0].replies).not.toBeDefined();
    });

    it('should response 200 with correct values with comments and replies in database', async () => {
      // Arrange
      const accessToken = await addUserAndLogin();
      const threadId = await addThread(accessToken);
      const commentId1 = await addComment(accessToken, threadId);
      const commentId2 = await addComment(accessToken, threadId);
      const commentId3 = await addComment(accessToken, threadId);
      const replyId1 = await addReply(accessToken, threadId, commentId1);
      const replyId2 = await addReply(accessToken, threadId, commentId1);
      const replyId3 = await addReply(accessToken, threadId, commentId2);
      await deleteReply(accessToken, threadId, commentId1, replyId1);
      await deleteComment(accessToken, threadId, commentId3);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      // comment 1
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(3);
      expect(responseJson.data.thread.comments[0].id)
        .toEqual(commentId1);
      // comment 1 replies
      expect(responseJson.data.thread.comments[0].replies).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].replies[0].id)
        .toEqual(replyId1);
      expect(responseJson.data.thread.comments[0].replies[1].id)
        .toEqual(replyId2);
      // comment 1 deleted replies
      expect(responseJson.data.thread.comments[0].replies[0].content)
        .toEqual('**balasan telah dihapus**');
      // comment 2
      expect(responseJson.data.thread.comments[1].id)
        .toEqual(commentId2);
      // comment 2 replies
      expect(responseJson.data.thread.comments[1].replies).toBeDefined();
      expect(responseJson.data.thread.comments[1].replies).toHaveLength(1);
      expect(responseJson.data.thread.comments[1].replies[0].id)
        .toEqual(replyId3);
      // deleted comment 3
      expect(responseJson.data.thread.comments[2].id)
        .toEqual(commentId3);
      expect(responseJson.data.thread.comments[2].content)
        .toEqual('**komentar telah dihapus**');
    });

    it('should response 200 with soft delete correct values in database', async () => {
      const accessToken1 = await addUserAndLogin();
      const accessToken2 = await addUserAndLogin({ username: 'dicoding2' });
      const threadId = await addThread(accessToken1);
      const commentId1 = await addComment(accessToken1, threadId);
      const commentId2 = await addComment(accessToken1, threadId);
      await addComment(accessToken2, threadId);
      await deleteComment(accessToken1, threadId, commentId1);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Arrange
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(3);
      expect(responseJson.data.thread.comments[0].content)
        .toEqual('**komentar telah dihapus**');
      expect(responseJson.data.thread.comments[1].id)
        .toEqual(commentId2);
    });

    it('should response 200 with correct like count', async () => {
      // Arrange
      const accessToken1 = await addUserAndLogin();
      const accessToken2 = await addUserAndLogin({ username: 'dicoding2' });
      const threadId = await addThread(accessToken1);
      const commentId1 = await addComment(accessToken1, threadId);
      const commentId2 = await addComment(accessToken1, threadId);
      await toggleLikeComment(accessToken1, threadId, commentId1);
      await toggleLikeComment(accessToken2, threadId, commentId1);
      await toggleLikeComment(accessToken2, threadId, commentId2);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Arrange
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(2);
      expect(responseJson.data.thread.comments[1].likeCount).toEqual(1);
    });

    it('should response 200 with correct like count and cancel like', async () => {
      // Arrange
      const accessToken1 = await addUserAndLogin();
      const accessToken2 = await addUserAndLogin({ username: 'dicoding2' });
      const threadId = await addThread(accessToken1);
      const commentId1 = await addComment(accessToken1, threadId);
      await addComment(accessToken1, threadId);
      await toggleLikeComment(accessToken1, threadId, commentId1);
      await toggleLikeComment(accessToken2, threadId, commentId1);
      await toggleLikeComment(accessToken2, threadId, commentId1);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Arrange
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(1);
      expect(responseJson.data.thread.comments[1].likeCount).toEqual(0);
    });

    it('should respose 404 when thread id not found', async () => {
      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/nonthreadid',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
});
