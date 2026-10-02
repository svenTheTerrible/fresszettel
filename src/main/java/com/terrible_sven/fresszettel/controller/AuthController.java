package com.terrible_sven.fresszettel.controller;

import com.terrible_sven.fresszettel.controller.dto.CreateUserRequest;
import com.terrible_sven.fresszettel.domain.user.User;
import com.terrible_sven.fresszettel.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("authentification")
@RequiredArgsConstructor
public class AuthController {

	private final UserService userService;

	@PostMapping("create")
	public User createUser(@RequestBody CreateUserRequest request) {
		return userService.createUser(request.email(), request.password());
	}
}
