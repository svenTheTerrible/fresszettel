package com.terrible_sven.fresszettel.config;

import org.hibernate.community.dialect.SQLiteDialect;
import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportRuntimeHints;

// spring.jpa.database-platform in application.properties only names this class as a string,
// so GraalVM's static analysis never sees the reference and strips it without this hint.
@Configuration
@ImportRuntimeHints(HibernateDialectHints.Registrar.class)
public class HibernateDialectHints {

	static class Registrar implements RuntimeHintsRegistrar {
		@Override
		public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
			hints.reflection().registerType(SQLiteDialect.class, MemberCategory.INVOKE_DECLARED_CONSTRUCTORS);
		}
	}
}
