const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');
const NewAuth = require('../../../Domains/authentications/entities/NewAuth');
const UserRepository = require('../../../Domains/users/UserRepository');
const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const PasswordHash = require('../../security/PasswordHash');
const UserUseCase = require('../UserUseCase');

describe('UserUseCase', () => {
  let mockUserRepository;
  let mockAuthenticationRepository;
  let mockAuthenticationTokenManager;
  let mockPasswordHash;
  beforeEach(() => {
    mockUserRepository = new UserRepository();
    mockAuthenticationRepository = new AuthenticationRepository();
    mockAuthenticationTokenManager = new AuthenticationTokenManager();
    mockPasswordHash = new PasswordHash();
  });
  describe('addUser action', () => {
    it('should orchestrating the add user action correctly', async () => {
      // Arrange
      const useCasePayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const expectedRegisteredUser = new RegisteredUser({
        id: 'user-123',
        username: useCasePayload.username,
        fullname: useCasePayload.fullname,
      });

      /** mocking needed function */
      mockUserRepository.verifyAvailableUsername = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockPasswordHash.hash = jest.fn()
        .mockImplementation(() => Promise.resolve('encrypted_password'));
      mockUserRepository.addUser = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedRegisteredUser));

      /** creating use case instance */
      const userUseCase = new UserUseCase({
        userRepository: mockUserRepository,
        authenticationRepository: {},
        authenticationTokenManager: {},
        passwordHash: mockPasswordHash,
      });

      // Action
      const registeredUser = await userUseCase.addUser(useCasePayload);

      // Assert
      expect(registeredUser).toStrictEqual(expectedRegisteredUser);
      expect(mockUserRepository.verifyAvailableUsername).toBeCalledWith(useCasePayload.username);
      expect(mockPasswordHash.hash).toBeCalledWith(useCasePayload.password);
      expect(mockUserRepository.addUser).toBeCalledWith(new RegisterUser({
        username: useCasePayload.username,
        password: 'encrypted_password',
        fullname: useCasePayload.fullname,
      }));
    });
  });

  describe('loginUser action', () => {
    it('should orchestrating the login user action correctly', async () => {
      // Arrange
      const useCasePayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const expectedAuthentication = new NewAuth({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });

      // Mocking
      mockUserRepository.getPasswordByUsername = jest.fn()
        .mockImplementation(() => Promise.resolve('encrypted_password'));
      mockPasswordHash.comparePassword = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockAuthenticationTokenManager.createAccessToken = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedAuthentication.accessToken));
      mockAuthenticationTokenManager.createRefreshToken = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedAuthentication.refreshToken));
      mockUserRepository.getIdByUsername = jest.fn()
        .mockImplementation(() => Promise.resolve('user-123'));
      mockAuthenticationRepository.addToken = jest.fn()
        .mockImplementation(() => Promise.resolve());

      // create use case instance
      const userUseCase = new UserUseCase({
        userRepository: mockUserRepository,
        authenticationRepository: mockAuthenticationRepository,
        authenticationTokenManager: mockAuthenticationTokenManager,
        passwordHash: mockPasswordHash,
      });

      // Action
      const actualAuthentication = await userUseCase.loginUser(useCasePayload);

      // Assert
      expect(actualAuthentication).toEqual(expectedAuthentication);
      expect(mockUserRepository.getPasswordByUsername)
        .toBeCalledWith('dicoding');
      expect(mockPasswordHash.comparePassword)
        .toBeCalledWith('secret', 'encrypted_password');
      expect(mockUserRepository.getIdByUsername)
        .toBeCalledWith('dicoding');
      expect(mockAuthenticationTokenManager.createAccessToken)
        .toBeCalledWith({ username: 'dicoding', id: 'user-123' });
      expect(mockAuthenticationTokenManager.createRefreshToken)
        .toBeCalledWith({ username: 'dicoding', id: 'user-123' });
      expect(mockAuthenticationRepository.addToken)
        .toBeCalledWith(expectedAuthentication.refreshToken);
    });
  });

  describe('logoutUser action', () => {
    it('should throw error if use case payload not contain refresh token', async () => {
      // Arrange
      const useCasePayload = {};
      const userUseCase = new UserUseCase({});

      // Action & Assert
      await expect(userUseCase.logoutUser(useCasePayload))
        .rejects
        .toThrowError('DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN');
    });

    it('should throw error if refresh token not string', async () => {
      // Arrange
      const useCasePayload = {
        refreshToken: 123,
      };
      const userUseCase = new UserUseCase({});

      // Action & Assert
      await expect(userUseCase.logoutUser(useCasePayload))
        .rejects
        .toThrowError('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
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

      const userUseCase = new UserUseCase({
        userRepository: {},
        authenticationRepository: mockAuthenticationRepository,
        authenticationTokenManager: {},
        passwordHash: {},
      });

      // Act
      await userUseCase.logoutUser(useCasePayload);

      // Assert
      expect(mockAuthenticationRepository.checkAvailabilityToken)
        .toHaveBeenCalledWith(useCasePayload.refreshToken);
      expect(mockAuthenticationRepository.deleteToken)
        .toHaveBeenCalledWith(useCasePayload.refreshToken);
    });
  });
});
