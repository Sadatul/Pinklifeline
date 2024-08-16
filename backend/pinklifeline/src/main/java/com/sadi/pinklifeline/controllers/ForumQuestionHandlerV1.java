package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.models.reqeusts.ForumQuestionReq;
import com.sadi.pinklifeline.models.reqeusts.VoteReq;
import com.sadi.pinklifeline.service.forum.ForumQuestionHandlerService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/v1/forum")
@Slf4j
public class ForumQuestionHandlerV1 {
    private final ForumQuestionHandlerService questionHandlerService;

    public ForumQuestionHandlerV1(ForumQuestionHandlerService questionHandlerService) {
        this.questionHandlerService = questionHandlerService;
    }

    @PostMapping
    public ResponseEntity<Void> createQuestion(@Valid @RequestBody ForumQuestionReq req)
    {
        log.debug("Add forum question req {}", req);
        Long id = questionHandlerService.addForumQuestion(req);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(id).toUri();
        return ResponseEntity.created(uri).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody ForumQuestionReq req){
        log.debug("update forum question req {}", req);
        questionHandlerService.updateForumQuestion(req, id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable Long id){
        log.debug("delete blog with id: {}", id);
        questionHandlerService.deleteForumQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/vote")
    public ResponseEntity<Map<Object, Object>> voteBlog(
            @PathVariable Long id,
            @Valid @RequestBody VoteReq req){
        log.debug("vote req received for id: {}, req: {}", id, req);
        int val = questionHandlerService.castVote(req, id);
        return ResponseEntity.ok(Collections.singletonMap("voteChange", val));
    }
}
