package com.terrible_sven.fresszettel.config;

import com.terrible_sven.fresszettel.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtService jwtService;

	@Override
	protected void doFilterInternal(
			@NonNull HttpServletRequest request,
			@NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {

		String header = request.getHeader("Authorization");

		if (header != null && header.startsWith("Bearer ")) {
			String token = header.substring(7);
			try {
				Claims claims = Jwts.parser()
						.verifyWith(jwtService.key())
						.build()
						.parseSignedClaims(token)
						.getPayload();

				Long userId = Long.valueOf(claims.getSubject());
				if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
					SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
							userId, token, Collections.emptyList()));
				}
			} catch (Exception e) {
				SecurityContextHolder.clearContext();
			}
		}

		filterChain.doFilter(request, response);
	}
}
