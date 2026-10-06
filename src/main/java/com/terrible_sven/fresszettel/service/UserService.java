package com.terrible_sven.fresszettel.service;

import com.terrible_sven.fresszettel.controller.dto.AuthResponse;
import com.terrible_sven.fresszettel.domain.user.User;
import com.terrible_sven.fresszettel.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public User createUser(String email, String password) {
		User user = new User();
		user.setEmail(email);
		user.setPassword(passwordEncoder.encode(password));
		return userRepository.save(user);
	}

	public Optional<User> authenticateUser(String email, String password) {
		return userRepository.findByEmail(email);
	}

	public AuthResponse createTokens(User user) {
		String accessToken = jwtService.createAccessToken(user);
		String refreshToken = jwtService.createRefreshToken(user);
		return new AuthResponse(accessToken, refreshToken);
	}

	/**
	 * Exchange a valid refresh token for a fresh access token. Returns empty when
	 * the token is missing, invalid, expired, or no longer maps to a user.
	 */
	public Optional<String> refreshAccessToken(String refreshToken) {
		if (refreshToken == null || refreshToken.isBlank()) {
			return Optional.empty();
		}
		try {
			Long userId = jwtService.parseUserId(refreshToken);
			return userRepository.findById(userId)
					.map(user -> jwtService.createAccessToken(user.getId()));
		} catch (Exception e) {
			return Optional.empty();
		}
	}
}
