package com.sadi.pinklifeline.integrationtests;

import com.icegreen.greenmail.configuration.GreenMailConfiguration;
import com.icegreen.greenmail.junit5.GreenMailExtension;
import com.icegreen.greenmail.util.ServerSetupTest;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.utility.DockerImageName;

public abstract class AbstractBaseIntegrationTest {
    protected static final MySQLContainer MYSQL_CONTAINER;
    protected static final GenericContainer<?> REDIS_CONTAINER;
    protected static final GenericContainer<?> RABBITMQ_CONTAINER;

    @RegisterExtension
    protected static GreenMailExtension greenMail = new GreenMailExtension(ServerSetupTest.SMTP)
            .withConfiguration(GreenMailConfiguration.aConfig().withUser("pinklifeline", "pinklifeline"))
            .withPerMethodLifecycle(false);

    static {
        MYSQL_CONTAINER = new MySQLContainer(DockerImageName.parse("mysql:latest"))
                .withDatabaseName("pinklifeline")
                .withUsername("pinklifeline")
                .withPassword("pinklifeline");

        REDIS_CONTAINER = new GenericContainer<>(DockerImageName.parse("redis/redis-stack:latest"))
                .withExposedPorts(6379, 8001);

        RABBITMQ_CONTAINER = new GenericContainer<>(DockerImageName.parse("sadatul/pinklifeline-rabbitmq-stomp"))
                .withEnv("RABBITMQ_DEFAULT_USER", "guest")
                .withEnv("RABBITMQ_DEFAULT_PASS", "guest")
                .withExposedPorts(61613, 5672, 15672);

        REDIS_CONTAINER.start();
        MYSQL_CONTAINER.start();
        RABBITMQ_CONTAINER.start();
    }

    @DynamicPropertySource
    public static void dynamicProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL_CONTAINER::getJdbcUrl);
        registry.add("spring.datasource.password", MYSQL_CONTAINER::getPassword);
        registry.add("spring.datasource.username", MYSQL_CONTAINER::getUsername);
        registry.add("spring.data.redis.host", REDIS_CONTAINER::getHost);
        registry.add("spring.data.redis.port", REDIS_CONTAINER::getFirstMappedPort);
        registry.add("RABBITMQ_HOST", RABBITMQ_CONTAINER::getHost);
        registry.add("RABBITMQ_PORT", RABBITMQ_CONTAINER::getFirstMappedPort);
    }

}
