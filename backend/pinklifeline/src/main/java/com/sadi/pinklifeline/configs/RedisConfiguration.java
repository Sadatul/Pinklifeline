package com.sadi.pinklifeline.configs;

import com.sadi.pinklifeline.repositories.AppointmentRepository;
import com.sadi.pinklifeline.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;

@Configuration
public class RedisConfiguration {
    @Bean
    public RedisTemplate<?, ?> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<?, ?> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        return template;
    }

    @Bean
    public RedisMessageListenerContainer redisContainer(RedisConnectionFactory connectionFactory,
                                                        MessageListenerAdapter listenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(listenerAdapter, new ChannelTopic("__keyevent@0__:expired"));
        return container;
    }

    @Bean
    MessageListenerAdapter listenerAdapter(KeyExpirationMessageListener listener) {
        return new MessageListenerAdapter(listener, "onMessage");
    }

    @Bean
    KeyExpirationMessageListener keyExpirationListener(AppointmentRepository appointmentRepository,
                                                       UserRepository userRepository,
                                                       @Value("${online.meeting.prefix}") String prefix) {
        return new KeyExpirationMessageListener(appointmentRepository, userRepository, prefix);
    }
}
