package com.terrible_sven.fresszettel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class FresszettelApplication {

	public static void main(String[] args) {
		SpringApplication.run(FresszettelApplication.class, args);
	}

}
