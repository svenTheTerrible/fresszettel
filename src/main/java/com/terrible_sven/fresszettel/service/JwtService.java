package com.terrible_sven.fresszettel.service;

import com.terrible_sven.fresszettel.domain.user.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtService {

	private final javax.crypto.SecretKey key;
	private final long accessTokenTtlMillis;
	private final long refreshTokenTtlMillis;

	public JwtService(
			@Value("${jwt.secret}") String secret,
			@Value("${jwt.access-token-ttl}") String accessTokenTtl,
			@Value("${jwt.refresh-token-ttl}") String refreshTokenTtl) {
		this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
		this.accessTokenTtlMillis = parseTtl(accessTokenTtl);
		this.refreshTokenTtlMillis = parseTtl(refreshTokenTtl);
	}

	public javax.crypto.SecretKey key() {
		return key;
	}

	public String createAccessToken(User user) {
		return buildToken(user, accessTokenTtlMillis);
	}

	public String createRefreshToken(User user) {
		return buildToken(user, refreshTokenTtlMillis);
	}

	private String buildToken(User user, long ttlMillis) {
		Date now = new Date();
		Date expiry = new Date(now.getTime() + ttlMillis);
		return Jwts.builder()
				.subject(String.valueOf(user.getId()))
				.claim("userId", user.getId())
				.issuedAt(now)
				.expiration(expiry)
				.signWith(key)
				.compact();
	}

	static long parseTtl(String value) {
		if(value == null || value.isBlank()){
			return 0;
		}
		return Long.parseLong(value);
	}
}
