package com.sadi.pinklifeline.configs;

import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.repositories.AppointmentRepository;
import com.sadi.pinklifeline.repositories.OnlineMeetingRepository;
import com.sadi.pinklifeline.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.listener.KeyExpirationEventMessageListener;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
public class RedisKeyExpirationListener extends KeyExpirationEventMessageListener {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    @Value("${online.meeting.prefix}")
    private String cachePrefix;

    public RedisKeyExpirationListener(RedisMessageListenerContainer listenerContainer, AppointmentRepository appointmentRepository, UserRepository userRepository) {
        super(listenerContainer);
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String key = message.toString();
        log.info("Key expired {}", key);
        if(key.startsWith(cachePrefix)){
            String[] expiredKey = key.split(":");
            log.info("Online key expired for user: {}", expiredKey[expiredKey.length - 1]);
            updateMySQLDatabase(Long.parseLong(expiredKey[expiredKey.length - 1]));
        }
    }

    private void updateMySQLDatabase(Long docId) {
        List<Roles> roles = userRepository.getRolesById(docId);
        if(roles.contains(Roles.ROLE_DOCTOR)){
            log.info("Update MySQL database for Doctor: {}", docId);
            appointmentRepository.updateAllUnfinishedMeetingForDoctor(docId);
        }
    }
}