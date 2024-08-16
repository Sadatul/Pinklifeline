package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.enums.BlogSortType;
import com.sadi.pinklifeline.models.entities.ForumQuestion;
import com.sadi.pinklifeline.models.reqeusts.ForumQuestionReq;
import com.sadi.pinklifeline.models.reqeusts.VoteReq;
import com.sadi.pinklifeline.models.responses.ForumQuestionFullRes;
import com.sadi.pinklifeline.models.responses.ForumQuestionsRes;
import com.sadi.pinklifeline.service.forum.ForumQuestionHandlerService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/v1/forum")
@Slf4j
public class ForumQuestionHandlerV1 {
    private final ForumQuestionHandlerService questionHandlerService;

    @Value("${forums.page-size}")
    private int forumPageSize;

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
    public ResponseEntity<Map<Object, Object>> voteQuestion(
            @PathVariable Long id,
            @Valid @RequestBody VoteReq req){
        log.debug("vote req received for id: {}, req: {}", id, req);
        int val = questionHandlerService.castVote(req, id);
        return ResponseEntity.ok(Collections.singletonMap("voteChange", val));
    }

    @GetMapping
    public ResponseEntity<PagedModel<ForumQuestionsRes>> getQuestions(
            @RequestParam(required = false, defaultValue = "1000-01-01") LocalDate startDate,
            @RequestParam(required = false, defaultValue = "9999-12-31") LocalDate endDate,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false, defaultValue = "TIME") BlogSortType sortType,
            @RequestParam(required = false, defaultValue = "DESC") Sort.Direction sortDirection,
            @RequestParam(required = false, defaultValue = "0") Integer pageNo
    ){
        log.debug("Req to get blogs");
        Pageable pageable = PageRequest.of(pageNo, forumPageSize);
        List<String> tagList = tags != null ?
                Arrays.asList(tags.split(",")) : new ArrayList<>();
        Specification<ForumQuestion> spec = questionHandlerService.getSpecification(startDate.atStartOfDay(),
                endDate.atTime(23, 59), userId, title,
                tagList, sortType, sortDirection);
        Page<ForumQuestionsRes> res = questionHandlerService.filterQuestions(spec, pageable);
        return ResponseEntity.ok(new PagedModel<>(res));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ForumQuestionFullRes> getForumQuestion(
            @PathVariable Long id){
        return ResponseEntity.ok(questionHandlerService.getFullQuestion(id));
    }
}
