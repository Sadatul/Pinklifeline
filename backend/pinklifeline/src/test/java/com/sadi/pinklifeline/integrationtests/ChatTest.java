package com.sadi.pinklifeline.integrationtests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sadi.pinklifeline.enums.MessageType;
import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.models.reqeusts.ChatMessageReq;
import com.sadi.pinklifeline.utils.DbCleaner;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import java.lang.reflect.Type;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Slf4j
public class ChatTest extends AbstractBaseIntegrationTest{

    @LocalServerPort
    private int port;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtEncoder jwtEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DbCleaner dbCleaner;

    @AfterEach
    public void cleanUp(){
        dbCleaner.clearDatabase();
    }

    @Test
    @Sql("/test/chat_test/chatTest.sql")
    public void whenUserId_getChatRooms() throws Exception {
        Long id = 2L;
        String token = mint(id, List.of(Roles.ROLE_PATIENT));
        mockMvc.perform(get("/v1/chat/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", token)))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.*", hasSize(3)))
                        .andExpect(jsonPath("$[0].roomId").value(2))
                        .andExpect(jsonPath("$[1].roomId").value(1))
                        .andExpect(jsonPath("$[2].roomId").value(3));

    }

    @Test
    @Sql("/test/chat_test/chatTest.sql")
    public void whenRoomId_getChatMessages() throws Exception {
        Long id = 2L;
        Long roomId = 2L;

        String token = mint(id, List.of(Roles.ROLE_PATIENT));
        mockMvc.perform(get("/v1/chat/messages/{id}", roomId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.*", hasSize(1)));

    }

    @Test
    @Sql(scripts = "/test/chat_test/chatTest.sql",
            config = @SqlConfig(transactionMode = SqlConfig.TransactionMode.ISOLATED))
    public void sendAndReceiveMessageTest() throws Exception {
        String token1 = mint(2L, List.of(Roles.ROLE_PATIENT));
        String token2 = mint(3L, List.of(Roles.ROLE_PATIENT));

        WebSocketStompClient stompClient1 = new WebSocketStompClient(new StandardWebSocketClient());
        WebSocketStompClient stompClient2 = new WebSocketStompClient(new StandardWebSocketClient());

        stompClient1.setMessageConverter(new MappingJackson2MessageConverter(objectMapper));
        stompClient2.setMessageConverter(new MappingJackson2MessageConverter(objectMapper));

        StompHeaders headers1 = new StompHeaders();
        headers1.add("Authorization", String.format("Bearer %s", token1));
        StompHeaders headers2 = new StompHeaders();
        headers2.add("Authorization", String.format("Bearer %s", token2));
        StompSession stompSession1 = stompClient1.connectAsync(String.format("ws://localhost:%d/ws", port),
                        new WebSocketHttpHeaders(),
                        headers1, new StompSessionHandlerAdapter() {}
                        )
                .get(1, TimeUnit.SECONDS);
        StompSession stompSession2 = stompClient2.connectAsync(String.format("ws://localhost:%d/ws", port),
                        new WebSocketHttpHeaders(),
                        headers2, new StompSessionHandlerAdapter() {}
                )
                .get(1, TimeUnit.SECONDS);

        final CountDownLatch latch1 = new CountDownLatch(1);
        final CountDownLatch latch2 = new CountDownLatch(1);
        final AtomicReference<ChatMessageReq> receivedMessage1 = new AtomicReference<>();
        final AtomicReference<ChatMessageReq> receivedMessage2 = new AtomicReference<>();

        stompSession1.subscribe("/user/2/queue/messages", new StompFrameHandler() {
            @Override
            public @NotNull Type getPayloadType(@NotNull StompHeaders headers) {
                return ChatMessageReq.class;
            }

            @Override
            public void handleFrame(@NotNull StompHeaders headers, Object payload) {
                ChatMessageReq message = (ChatMessageReq) payload;
                log.info("Received message 2: {}", message);
                receivedMessage1.set(message);
                latch1.countDown();
            }
        });

        stompSession2.subscribe("/user/3/queue/messages", new StompFrameHandler() {
            @Override
            public @NotNull Type getPayloadType(@NotNull StompHeaders headers) {
                return ChatMessageReq.class;
            }

            @Override
            public void handleFrame(@NotNull StompHeaders headers, Object payload) {
                ChatMessageReq message = (ChatMessageReq) payload;
                log.info("Received message 3: {}", message);
                receivedMessage2.set(message);
                latch2.countDown();
            }
        });


        ChatMessageReq req1 = new ChatMessageReq(3L, "RECEIVED1", LocalDateTime.now(), MessageType.TEXT);
        stompSession1.send("/app/chat", req1);

        ChatMessageReq req2 = new ChatMessageReq(2L, "RECEIVED2", LocalDateTime.now(), MessageType.TEXT);
        stompSession2.send("/app/chat", req2);
        if(latch2.await(3, TimeUnit.SECONDS)){
            assertEquals("RECEIVED1", receivedMessage2.get().getMessage());
        } else {
            fail("Message form user 1 was not received");
        }

        if(latch1.await(3, TimeUnit.SECONDS)){
            assertEquals("RECEIVED2", receivedMessage1.get().getMessage());
        } else {
            fail("Message form user 2 was not received");
        }

    }

    private String mint(Long id, List<Roles> roles){
        JwtClaimsSet.Builder builder = JwtClaimsSet.builder()
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .subject(id.toString())
                .issuer("self")
                .audience(List.of("pinklifeline"))
                .claim("scope", roles);
        JwtEncoderParameters parameters = JwtEncoderParameters.from(builder.build());
        return this.jwtEncoder.encode(parameters).getTokenValue();
    }
}
