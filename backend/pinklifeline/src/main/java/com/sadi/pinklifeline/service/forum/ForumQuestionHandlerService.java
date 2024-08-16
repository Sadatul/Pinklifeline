package com.sadi.pinklifeline.service.forum;

import com.sadi.pinklifeline.enums.VoteType;
import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.entities.ForumQuestion;
import com.sadi.pinklifeline.models.entities.ForumQuestionVote;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.ForumQuestionReq;
import com.sadi.pinklifeline.models.reqeusts.VoteReq;
import com.sadi.pinklifeline.repositories.forum.ForumQuestionRepository;
import com.sadi.pinklifeline.repositories.forum.ForumQuestionVoteRepository;
import com.sadi.pinklifeline.service.UserService;
import com.sadi.pinklifeline.utils.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class ForumQuestionHandlerService {
    private final ForumQuestionRepository forumQuestionRepository;
    private final ForumQuestionVoteRepository forumQuestionVoteRepository;
    private final UserService userService;

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
        Optional<ForumQuestionVote> vote = forumQuestionVoteRepository.findByQuestionIdAndUserId(id, userId);

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
}
