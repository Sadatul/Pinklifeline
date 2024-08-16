package com.sadi.pinklifeline.service.forum;

import static com.sadi.pinklifeline.controllers.forum.ForumAnswerHandlerV1.ForumAnswerUpdateReq;

import com.sadi.pinklifeline.enums.VoteType;
import com.sadi.pinklifeline.exceptions.BadRequestFromUserException;
import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.entities.*;
import com.sadi.pinklifeline.models.reqeusts.ForumAnswerReq;
import com.sadi.pinklifeline.models.reqeusts.VoteReq;
import com.sadi.pinklifeline.repositories.forum.ForumAnswerRepository;
import com.sadi.pinklifeline.repositories.forum.ForumAnswerVoteRepository;
import com.sadi.pinklifeline.service.UserService;
import com.sadi.pinklifeline.utils.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class ForumAnswerHandlerService {
    private final ForumAnswerRepository forumAnswerRepository;
    private final UserService userService;
    private final ForumQuestionHandlerService forumQuestionHandlerService;
    private final ForumAnswerVoteRepository forumAnswerVoteRepository;

    public ForumAnswerHandlerService(ForumAnswerRepository forumAnswerRepository, UserService userService, ForumQuestionHandlerService forumQuestionHandlerService, ForumAnswerVoteRepository forumAnswerVoteRepository) {
        this.forumAnswerRepository = forumAnswerRepository;
        this.userService = userService;
        this.forumQuestionHandlerService = forumQuestionHandlerService;
        this.forumAnswerVoteRepository = forumAnswerVoteRepository;
    }

    public ForumAnswer getForumAnswer(Long id) {
        return forumAnswerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                String.format("Forum answer with id %s not found", id)
        ));
    }

    public void verifyForumAnswerOwner(ForumAnswer answer, Long userId) {
        if (!Objects.equals(answer.getUser().getId(), userId)) {
            throw new AuthorizationDeniedException(
                    String.format("User with id:%d doesn't have access to the forum answer with id: %d"
                            , userId, answer.getId()),
                    () -> false);
        }
    }

    public Long addForumAnswer(@Valid ForumAnswerReq req) {
        Long userId = SecurityUtils.getOwnerID();
        ForumQuestion question = forumQuestionHandlerService.getForumQuestion(req.getQuestionId());
        User user = userService.getUserIfRegisteredOnlyId(userId);
        ForumAnswer forumAnswer;
        if(req.getParentId() != null) {
            ForumAnswer parentAnswer = getForumAnswer(req.getParentId());
            if(!parentAnswer.getQuestion().getId().equals(req.getQuestionId())) {
                throw new BadRequestFromUserException(
                        String.format("ParentAnswer with id: %d doesn't belong to question with id: %d",
                                req.getParentId(),
                                req.getQuestionId())
                );
            }
            forumAnswer = new ForumAnswer(user, question, parentAnswer, req.getBody());
        } else
            forumAnswer = new ForumAnswer(user, question, null, req.getBody());

        return forumAnswerRepository.save(forumAnswer).getId();

    }

    public void updateForumAnswer(ForumAnswerUpdateReq req, Long id) {
        Long userId = SecurityUtils.getOwnerID();
        ForumAnswer forumAnswer = getForumAnswer(id);
        verifyForumAnswerOwner(forumAnswer, userId);

        forumAnswer.setBody(req.getBody());
        forumAnswerRepository.save(forumAnswer);
    }

    public void deleteForumAnswer(Long id) {
        Long userId = SecurityUtils.getOwnerID();
        ForumAnswer forumAnswer = getForumAnswer(id);
        verifyForumAnswerOwner(forumAnswer, userId);
        forumAnswerRepository.delete(forumAnswer);
    }

    public int castVote(@Valid VoteReq req, Long id) {
        Long userId = SecurityUtils.getOwnerID();
        ForumAnswer answer = getForumAnswer(id);
        User user = userService.getUserIfRegisteredOnlyId(userId);
        Optional<ForumAnswerVote> vote = forumAnswerVoteRepository.findByAnswerIdAndUserId(id, userId);

        int returnVal;
        if (req.getVoteType().equals(VoteType.UNVOTE)) {
            if(vote.isPresent()) {
                if(vote.get().getValue() == -1) returnVal = 1;
                else returnVal = -1;
                forumAnswerVoteRepository.delete(vote.get());
            }
            else return 0;
        }
        else if(req.getVoteType().equals(VoteType.UPVOTE)) {
            if(vote.isPresent()) {
                if(vote.get().getValue() == -1){
                    returnVal = 2;
                    vote.get().setValue(1);
                    forumAnswerVoteRepository.save(vote.get());
                } else return 0;
            }
            else{
                returnVal = 1;
                forumAnswerVoteRepository.save(new ForumAnswerVote(user, answer, 1));
            }
        }
        else {
            if(vote.isPresent()) {
                if(vote.get().getValue() == 1){
                    returnVal = -2;
                    vote.get().setValue(-1);
                    forumAnswerVoteRepository.save(vote.get());
                } else return 0;
            }
            else{
                returnVal = -1;
                forumAnswerVoteRepository.save(new ForumAnswerVote(user, answer, -1));
            }
        }
        answer.setVoteCount(answer.getVoteCount() + returnVal);
        forumAnswerRepository.save(answer);
        return returnVal;
    }
}
