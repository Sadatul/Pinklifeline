package com.sadi.pinklifeline.controllers.forum;

import com.sadi.pinklifeline.enums.BlogSortType;
import com.sadi.pinklifeline.models.reqeusts.ForumAnswerReq;

import com.sadi.pinklifeline.models.reqeusts.VoteReq;
import com.sadi.pinklifeline.models.responses.ForumAnswerRes;
import com.sadi.pinklifeline.service.forum.ForumAnswerHandlerService;
import com.sadi.pinklifeline.utils.SecurityUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/forum/answers")
@Slf4j
public class ForumAnswerHandlerV1 {
    private final ForumAnswerHandlerService forumAnswerHandlerService;

    public ForumAnswerHandlerV1(ForumAnswerHandlerService forumAnswerHandlerService) {
        this.forumAnswerHandlerService = forumAnswerHandlerService;
    }

    @PostMapping
    public ResponseEntity<Void> createAnswer(@Valid @RequestBody ForumAnswerReq req)
    {
        log.debug("Add forum answer req {}", req);
        Long id = forumAnswerHandlerService.addForumAnswer(req);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(id).toUri();
        return ResponseEntity.created(uri).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateAnswer(
            @PathVariable Long id,
            @Valid @RequestBody ForumAnswerUpdateReq req){
        log.debug("update forum answer req {}", req);
        forumAnswerHandlerService.updateForumAnswer(req, id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnswer(
            @PathVariable Long id){
        log.debug("delete forum answer with id: {}", id);
        forumAnswerHandlerService.deleteForumAnswer(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/vote")
    public ResponseEntity<Map<Object, Object>> voteAnswer(
            @PathVariable Long id,
            @Valid @RequestBody VoteReq req){
        log.debug("vote req received for forum answer: id: {}, req: {}", id, req);
        int val = forumAnswerHandlerService.castVote(req, id);
        return ResponseEntity.ok(Collections.singletonMap("voteChange", val));
    }

    @GetMapping
    public ResponseEntity<List<ForumAnswerRes>> getAnswersForQuestion(
            @RequestParam Long questionId,
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false, defaultValue = "TIME") BlogSortType sortType,
            @RequestParam(required = false, defaultValue = "DESC") Sort.Direction sortDirection
    ){
        Sort sort = Sort.by(sortDirection, (sortType.equals(BlogSortType.VOTES) ? "voteCount" : "createdAt"));
        List<ForumAnswerRes> answers = forumAnswerHandlerService.getForumAnswerWithAuthorData(questionId, parentId, sort,
                SecurityUtils.getOwnerID());
        return ResponseEntity.ok(answers);
    }

    @Data
    @NoArgsConstructor
    public static class ForumAnswerUpdateReq {
        @NotNull
        @Size(min = 1, max = 65535, message = "Content length must be within 1 to 65535 chars")
        private String body;
    }
}
