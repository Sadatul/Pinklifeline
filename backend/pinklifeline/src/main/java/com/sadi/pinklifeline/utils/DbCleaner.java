package com.sadi.pinklifeline.utils;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

//"""
//    USE WITH EXTREME QUATION
//    USE WITH EXTREME QUATION
//    USE WITH EXTREME QUATION
//"""

@Profile("test")
@Component
public class DbCleaner {
    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public void clearDatabase() {
        List<String> tables = entityManager.createNativeQuery(
                        "SELECT table_name FROM information_schema.tables " +
                                "WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE' " +
                                "AND table_name <> 'flyway_schema_history'")
                .getResultList();

        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();

        for (String table : tables) {
            entityManager.createNativeQuery("TRUNCATE TABLE " + table).executeUpdate();
        }

        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();
    }
}