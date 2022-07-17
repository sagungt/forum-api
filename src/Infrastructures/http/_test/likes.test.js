const createServer = require('../createServer');
const pool = require('../../database/postgres/pool');
const container = require('../../container');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  let server;
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
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

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes endpoint', () => {
    it('should response 401 when headers authentication token incorrect', async () => {
      // Arrange
      const accessToken = await addUserAndLogin();
      const threadId = await addThread(accessToken);
      const commentId = await addComment(accessToken, threadId);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 200 when liking comment', async () => {
      // Arrange
      const accessToken = await addUserAndLogin();
      const threadId = await addThread(accessToken);
      const commentId = await addComment(accessToken, threadId);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 when cancel liking comment', async () => {
      // Arrange
      const accessToken = await addUserAndLogin();
      const threadId = await addThread(accessToken);
      const commentId = await addComment(accessToken, threadId);

      // Action
      await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
