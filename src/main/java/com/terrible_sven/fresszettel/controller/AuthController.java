package com.terrible_sven.fresszettel.controller;

import com.terrible_sven.fresszettel.controller.dto.AuthResponse;
import com.terrible_sven.fresszettel.controller.dto.CreateUserRequest;
import com.terrible_sven.fresszettel.controller.dto.LoginRequest;
import com.terrible_sven.fresszettel.domain.user.User;
import com.terrible_sven.fresszettel.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("authentification")
@RequiredArgsConstructor
public class AuthController {

	private final UserService userService;

	@PostMapping("login")
	public Optional<AuthResponse> loginUser(@RequestBody LoginRequest request) {
		return userService.authenticateUser(request.email(), request.password())
				.map(userService::createTokens);
	}

	@PostMapping("create")
	public User createUser(@RequestBody CreateUserRequest request) {
		return userService.createUser(request.email(), request.password());
	}
}
