const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AuthenticationUseCase = require('../AuthenticationUseCase');

describe('AuthenticationUseCase', () => {
  let mockAuthenticationRepository;
  let mockAuthenticationTokenManager;
  beforeEach(() => {
    mockAuthenticationRepository = new AuthenticationRepository();
    mockAuthenticationTokenManager = new AuthenticationTokenManager();
  });
  describe('deleteAuthentication action', () => {
    it('should throw error if use case payload not contain refresh token', async () => {
      // Arrange
      const useCasePayload = {};
      const authenticationUseCase = new AuthenticationUseCase({});

      // Action & Assert
      await expect(authenticationUseCase.deleteAuthentication(useCasePayload))
        .rejects
        .toThrowError('AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN');
    });

    it('should throw error if refresh token not string', async () => {
      // Arrange
      const useCasePayload = {
        refreshToken: 123,
      };
      const authenticationUseCase = new AuthenticationUseCase({});

      // Action & Assert
      await expect(authenticationUseCase.deleteAuthentication(useCasePayload))
        .rejects
        .toThrowError('AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should orchestrating the delete authentication action correctly', async () => {
      // Arrange
      const useCasePayload = {
        refreshToken: 'refreshToken',
      };

      mockAuthenticationRepository.checkAvailabilityToken = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockAuthenticationRepository.deleteToken = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const authenticationUseCase = new AuthenticationUseCase({
        authenticationRepository: mockAuthenticationRepository,
        authenticationTokenManager: {},
      });

      // Act
      await authenticationUseCase.deleteAuthentication(useCasePayload);

      // Assert
      expect(mockAuthenticationRepository.checkAvailabilityToken)
        .toHaveBeenCalledWith(useCasePayload.refreshToken);
      expect(mockAuthenticationRepository.deleteToken)
        .toHaveBeenCalledWith(useCasePayload.refreshToken);
    });
  });

  describe('RefreshAuthenticationUseCase', () => {
    it('should throw error if use case payload not contain refresh token', async () => {
      // Arrange
      const useCasePayload = {};
      const authenticationUseCase = new AuthenticationUseCase({});

      // Action & Assert
      await expect(authenticationUseCase.refreshAuthentication(useCasePayload))
        .rejects
        .toThrowError('AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN');
    });

    it('should throw error if refresh token not string', async () => {
      // Arrange
      const useCasePayload = {
        refreshToken: 1,
      };
      const authenticationUseCase = new AuthenticationUseCase({});

      // Action & Assert
      await expect(authenticationUseCase.refreshAuthentication(useCasePayload))
        .rejects
        .toThrowError('AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should orchestrating the refresh authentication action correctly', async () => {
      // Arrange
      const useCasePayload = {
        refreshToken: 'some_refresh_token',
      };
      // Mocking
      mockAuthenticationRepository.checkAvailabilityToken = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockAuthenticationTokenManager.verifyRefreshToken = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockAuthenticationTokenManager.decodePayload = jest.fn()
        .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }));
      mockAuthenticationTokenManager.createAccessToken = jest.fn()
        .mockImplementation(() => Promise.resolve('some_new_access_token'));
      // Create the use case instace
      const authenticationUseCase = new AuthenticationUseCase({
        authenticationRepository: mockAuthenticationRepository,
        authenticationTokenManager: mockAuthenticationTokenManager,
      });

      // Action
      const accessToken = await authenticationUseCase.refreshAuthentication(useCasePayload);

      // Assert
      expect(mockAuthenticationTokenManager.verifyRefreshToken)
        .toBeCalledWith(useCasePayload.refreshToken);
      expect(mockAuthenticationRepository.checkAvailabilityToken)
        .toBeCalledWith(useCasePayload.refreshToken);
      expect(mockAuthenticationTokenManager.decodePayload)
        .toBeCalledWith(useCasePayload.refreshToken);
      expect(mockAuthenticationTokenManager.createAccessToken)
        .toBeCalledWith({ username: 'dicoding', id: 'user-123' });
      expect(accessToken).toEqual('some_new_access_token');
    });
  });
});
