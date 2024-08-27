package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.enums.BlogSortType;
import com.sadi.pinklifeline.enums.SubscriptionType;
import com.sadi.pinklifeline.models.entities.Blog;
import com.sadi.pinklifeline.models.entities.ForumQuestion;
import com.sadi.pinklifeline.models.responses.*;
import com.sadi.pinklifeline.service.BlogHandlerService;
import com.sadi.pinklifeline.service.forum.ForumAnswerHandlerService;
import com.sadi.pinklifeline.service.forum.ForumQuestionHandlerService;
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

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/v1/anonymous")
@Slf4j
public class AnonymousUserHandlerV1 {
    private final BlogHandlerService blogHandlerService;
    private final ForumQuestionHandlerService questionHandlerService;
    private final ForumAnswerHandlerService forumAnswerHandlerService;

    @Value("${blogs.page-size}")
    private int blogPageSize;

    @Value("${forums.page-size}")
    private int forumPageSize;

    public AnonymousUserHandlerV1(BlogHandlerService blogHandlerService, ForumQuestionHandlerService questionHandlerService, ForumAnswerHandlerService forumAnswerHandlerService) {
        this.blogHandlerService = blogHandlerService;
        this.questionHandlerService = questionHandlerService;
        this.forumAnswerHandlerService = forumAnswerHandlerService;
    }

    @GetMapping("/blogs")
    public ResponseEntity<PagedModel<BlogsRes>> getBlogs(
            @RequestParam(required = false, defaultValue = "1000-01-01") LocalDate startDate,
            @RequestParam(required = false, defaultValue = "9999-12-31") LocalDate endDate,
            @RequestParam(required = false) Long docId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String doctorName,
            @RequestParam(required = false, defaultValue = "TIME") BlogSortType sortType,
            @RequestParam(required = false, defaultValue = "DESC") Sort.Direction sortDirection,
            @RequestParam(required = false, defaultValue = "0") Integer pageNo
    ){
        log.debug("Req to get blogs by anonymous user");
        Pageable pageable = PageRequest.of(pageNo, blogPageSize);
        Specification<Blog> spec = blogHandlerService.getSpecification(startDate.atStartOfDay(),
                endDate.atTime(23, 59), docId, title,
                doctorName, sortType, sortDirection);
        Page<BlogsRes> res = blogHandlerService.filterBlogs(spec, pageable, Optional.empty());
        return ResponseEntity.ok(new PagedModel<>(res));
    }

    @GetMapping("/blogs/{id}")
    public ResponseEntity<BlogFullRes> getFullBlog(
            @PathVariable Long id){
        log.debug("get blog with id by anonymous user: {}", id);
        return ResponseEntity.ok(blogHandlerService.getBlogFullRes(id, null));
    }

    @GetMapping("/forum")
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
        log.debug("Req to get forum questions by anonymous user");
        Pageable pageable = PageRequest.of(pageNo, forumPageSize);
        List<String> tagList = tags != null ?
                Arrays.asList(tags.split(",")) : new ArrayList<>();
        Specification<ForumQuestion> spec = questionHandlerService.getSpecification(startDate.atStartOfDay(),
                endDate.atTime(23, 59), userId, title,
                tagList, sortType, sortDirection);
        Page<ForumQuestionsRes> res = questionHandlerService.filterQuestions(spec, pageable, Optional.empty());
        return ResponseEntity.ok(new PagedModel<>(res));
    }

    @GetMapping("/forum/{id}")
    public ResponseEntity<ForumQuestionFullRes> getForumQuestion(
            @PathVariable Long id){
        log.debug("get forum question with id by anonymous user: {}", id);
        return ResponseEntity.ok(questionHandlerService.getFullQuestion(id, null));
    }

    @GetMapping("/forum/answers")
    public ResponseEntity<List<ForumAnswerRes>> getAnswersForQuestion(
            @RequestParam Long questionId,
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false, defaultValue = "TIME") BlogSortType sortType,
            @RequestParam(required = false, defaultValue = "DESC") Sort.Direction sortDirection
    ){
        Sort sort = Sort.by(sortDirection, (sortType.equals(BlogSortType.VOTES) ? "voteCount" : "createdAt"));
        List<ForumAnswerRes> answers = forumAnswerHandlerService.getForumAnswerWithAuthorData(questionId, parentId, sort,
                null);
        return ResponseEntity.ok(answers);
    }

    @GetMapping("/forum/answers/{id}")
    public ResponseEntity<ForumAnswerRes> getForumAnswer(@PathVariable Long id){
        ForumAnswerRes answer = forumAnswerHandlerService.getForumAnswerResById(id, null);
        return ResponseEntity.ok(answer);
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<Map<String, Object>> getSubscriptions(){
        Map<String, Object> res = Stream.of(new Object[][]{
            {"DOCTOR_MONTHLY", SubscriptionType.DOCTOR_MONTHLY.getPrice()},
            {"DOCTOR_YEARLY", SubscriptionType.DOCTOR_YEARLY.getPrice()},
            {"USER_MONTHLY", SubscriptionType.USER_MONTHLY.getPrice()},
            {"USER_YEARLY", SubscriptionType.USER_YEARLY.getPrice()},
        }).collect(Collectors.toMap(val -> (String) val[0], val -> val[1]));
        return ResponseEntity.ok(res);
    }
}
