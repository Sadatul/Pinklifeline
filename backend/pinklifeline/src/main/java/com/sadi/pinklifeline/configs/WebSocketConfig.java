package com.sadi.pinklifeline.configs;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;


@Configuration
@EnableWebSocketMessageBroker
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
	@Value("${RABBITMQ_HOST}")
	private String rabbitmqHost;

	@Value("${RABBITMQ_PORT}")
	private int rabbitmqPort;

	private TaskScheduler messageBrokerTaskScheduler;

	@Autowired
	public void setMessageBrokerTaskScheduler(@Lazy TaskScheduler taskScheduler) {
		this.messageBrokerTaskScheduler = taskScheduler;
	}

    @Override
	public void configureMessageBroker(MessageBrokerRegistry config) {
//		config.enableSimpleBroker("/user").setHeartbeatValue(new long[]{10000, 10000})
//				.setTaskScheduler(this.messageBrokerTaskScheduler);

		config.enableStompBrokerRelay("/queue", "/topic", "/exchange", "/amq/queue")
				.setRelayHost(rabbitmqHost)
				.setRelayPort(rabbitmqPort)
				.setClientLogin("guest")
				.setClientPasscode("guest")
				.setSystemLogin("guest")
				.setSystemPasscode("guest")
				.setSystemHeartbeatSendInterval(10000)
				.setSystemHeartbeatReceiveInterval(10000)
				.setTaskScheduler(this.messageBrokerTaskScheduler);
		config.setApplicationDestinationPrefixes("/app");
		config.setUserDestinationPrefix("/user");
	}

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		registry.addEndpoint("/ws")
				.setAllowedOriginPatterns("*");
	}
}
