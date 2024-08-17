package com.sadi.pinklifeline.service.forum;

import com.sadi.pinklifeline.enums.BlogSortType;
import com.sadi.pinklifeline.enums.VoteType;
import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.entities.*;
import com.sadi.pinklifeline.models.reqeusts.ForumQuestionReq;
import com.sadi.pinklifeline.models.reqeusts.VoteReq;
import com.sadi.pinklifeline.models.responses.ForumQuestionFullRes;
import com.sadi.pinklifeline.models.responses.ForumQuestionsRes;
import com.sadi.pinklifeline.repositories.forum.ForumQuestionRepository;
import com.sadi.pinklifeline.repositories.forum.ForumQuestionVoteRepository;
import com.sadi.pinklifeline.service.UserService;
import com.sadi.pinklifeline.specifications.ForumQuestionSpecification;
import com.sadi.pinklifeline.utils.SecurityUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class ForumQuestionHandlerService {
    private final ForumQuestionRepository forumQuestionRepository;
    private final ForumQuestionVoteRepository forumQuestionVoteRepository;
    private final UserService userService;

    @PersistenceContext
    private EntityManager entityManager;

    public ForumQuestionHandlerService(ForumQuestionRepository forumQuestionRepository, ForumQuestionVoteRepository forumQuestionVoteRepository, UserService userService) {
        this.forumQuestionRepository = forumQuestionRepository;
        this.forumQuestionVoteRepository = forumQuestionVoteRepository;
        this.userService = userService;
    }

    public ForumQuestion getForumQuestion(Long id) {
        return forumQuestionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                String.format("Forum question with id %s not found", id)
        ));
    }

    public void verifyForumQuestionOwner(ForumQuestion question, Long userId) {
        if (!Objects.equals(question.getUser().getId(), userId)) {
            throw new AuthorizationDeniedException(
                    String.format("User with id:%d doesn't have access to the forum question with id: %d"
                            , userId, question.getId()),
                    () -> false);
        }
    }

    public Long addForumQuestion(@Valid ForumQuestionReq req) {
        Long userId = SecurityUtils.getOwnerID();
        User user = userService.getUserIfRegisteredOnlyId(userId);
        ForumQuestion forumQuestion = new ForumQuestion(user, req.getTitle(), req.getBody(), req.getTags());
        return forumQuestionRepository.save(forumQuestion).getId();
    }

    public void updateForumQuestion(@Valid ForumQuestionReq req, Long id) {
        Long userId = SecurityUtils.getOwnerID();
        ForumQuestion question = getForumQuestion(id);
        verifyForumQuestionOwner(question, userId);

        question.setTitle(req.getTitle());
        question.setBody(req.getBody());
        question.setTags(req.getTags());

        forumQuestionRepository.save(question);
    }

    public void deleteForumQuestion(Long id) {
        Long userId = SecurityUtils.getOwnerID();
        ForumQuestion question = getForumQuestion(id);
        verifyForumQuestionOwner(question, userId);
        forumQuestionRepository.delete(question);
    }

    public int castVote(VoteReq req, Long id) {
        Long userId = SecurityUtils.getOwnerID();
        ForumQuestion question = getForumQuestion(id);
        User user = userService.getUserIfRegisteredOnlyId(userId);
        Optional<ForumQuestionVote> vote = getVoteEntryByQuestionIdAndUserId(id, userId);

        int returnVal;
        if (req.getVoteType().equals(VoteType.UNVOTE)) {
            if(vote.isPresent()) {
                if(vote.get().getValue() == -1) returnVal = 1;
                else returnVal = -1;
                forumQuestionVoteRepository.delete(vote.get());
            }
            else return 0;
        }
        else if(req.getVoteType().equals(VoteType.UPVOTE)) {
            if(vote.isPresent()) {
                if(vote.get().getValue() == -1){
                    returnVal = 2;
                    vote.get().setValue(1);
                    forumQuestionVoteRepository.save(vote.get());
                } else return 0;
            }
            else{
                returnVal = 1;
                forumQuestionVoteRepository.save(new ForumQuestionVote(user, question, 1));
            }
        }
        else {
            if(vote.isPresent()) {
                if(vote.get().getValue() == 1){
                    returnVal = -2;
                    vote.get().setValue(-1);
                    forumQuestionVoteRepository.save(vote.get());
                } else return 0;
            }
            else{
                returnVal = -1;
                forumQuestionVoteRepository.save(new ForumQuestionVote(user, question, -1));
            }
        }
        question.setVoteCount(question.getVoteCount() + returnVal);
        forumQuestionRepository.save(question);
        return returnVal;
    }

    public Optional<ForumQuestionVote> getVoteEntryByQuestionIdAndUserId(Long id, Long userId) {
        return forumQuestionVoteRepository.findByQuestionIdAndUserId(id, userId);
    }

    public Specification<ForumQuestion> getSpecification(LocalDateTime startDate, LocalDateTime endDate,
                                                Long userId, String title, List<String> tags,
                                                BlogSortType sortType, Sort.Direction sortDirection) {
        Specification<ForumQuestion> spec = Specification.where(null);
        if (startDate != null && endDate != null) {
            spec = spec.and(ForumQuestionSpecification.withDateBetween(startDate, endDate));
        }
        if (title != null && !title.isEmpty()) {
            spec = spec.and(ForumQuestionSpecification.withTitle(title));
        }
        if (tags != null && !tags.isEmpty()) {
            spec = spec.and(ForumQuestionSpecification.withTags(tags));
        }
        if (userId != null) {
            spec = spec.and(ForumQuestionSpecification.withUserId(userId));
        }
        if(sortType.equals(BlogSortType.VOTES)){
            spec = spec.and(ForumQuestionSpecification.sortByVote(sortDirection));
        }
        else{
            spec = spec.and(ForumQuestionSpecification.sortByTimestamp(sortDirection));
        }
        return spec;
    }

    public Page<ForumQuestionsRes> filterQuestions(Specification<ForumQuestion> spec, Pageable pageable) {
        Long userId = SecurityUtils.getOwnerID();
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<ForumQuestionsRes> cq = cb.createQuery(ForumQuestionsRes.class);

        Root<ForumQuestion> root = cq.from(ForumQuestion.class);
        Subquery<Long> voteValueSubQuery = cq.subquery(Long.class);
        Root<ForumQuestionVote> forumQuestionVoteRoot = voteValueSubQuery.from(ForumQuestionVote.class);

        voteValueSubQuery.select(forumQuestionVoteRoot.get("value"));
        voteValueSubQuery.where(
                cb.equal(forumQuestionVoteRoot.get("question").get("id"), root.get("id")),
                cb.equal(forumQuestionVoteRoot.get("user").get("id"), userId)
        );

        List<Predicate> predicates = new ArrayList<>();
        if (spec != null) {
            Predicate specPredicate = spec.toPredicate(root, cq, cb);
            if (specPredicate != null) {
                predicates.add(specPredicate);
            }
        }
        cq.where(predicates.toArray(new Predicate[0]));

        cq.select(cb.construct(ForumQuestionsRes.class,
                root.get("id"),
                root.get("title"),
                voteValueSubQuery.alias("voteByUser"),
                root.get("user").get("fullName"),
                root.get("user").get("id"),
                root.get("user").get("profilePicture"),
                root.get("voteCount"),
                root.get("createdAt")
        ));

        TypedQuery<ForumQuestionsRes> query = entityManager.createQuery(cq);
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());

        List<ForumQuestionsRes> result =  query.getResultList();
        assert spec != null;
        long total = forumQuestionRepository.count(spec);
        return new PageImpl<>(result, pageable, total);
    }

    public ForumQuestionFullRes getFullQuestion(Long id){
        Long userId = SecurityUtils.getOwnerID();
        ForumQuestionFullRes forumQuestionFullRes = forumQuestionRepository.getForumQuestionFullResById(id, userId).orElseThrow(() -> new ResourceNotFoundException(
                String.format("Question with id: %s not found", id)
        ));
        forumQuestionFullRes.setTags(forumQuestionRepository.getTagsById(id));
        return forumQuestionFullRes;
    }
}
