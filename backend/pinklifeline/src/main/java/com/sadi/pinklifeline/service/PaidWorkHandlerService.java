package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.PaidWorkStatus;
import com.sadi.pinklifeline.exceptions.BadRequestFromUserException;
import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.entities.PaidWork;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.PaidWorkReq;
import com.sadi.pinklifeline.repositories.PaidWorkRepository;
import com.sadi.pinklifeline.utils.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PaidWorkHandlerService {
    private final PaidWorkRepository paidWorkRepository;
    private final UserService userService;

    public void verifyPaidWorkForUpdateAndDelete(PaidWork paidWork, Long userId) {
        if (!Objects.equals(paidWork.getUser().getId(), userId)) {
            throw new AuthorizationDeniedException(
                    String.format("User with id:%d doesn't have access to the paidWork with id: %d"
                            , userId, paidWork.getId()),
                    () -> false);
        }

        if (!Objects.equals(paidWork.getStatus(), PaidWorkStatus.POSTED)){
            throw new BadRequestFromUserException(
                    String.format("Work with status %s can't be update or deleted", paidWork.getStatus())
            );
        }
    }

    public PaidWork getPaidWork(Long id) {
        return paidWorkRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                String.format("Paid work with id %s not found", id)
        ));
    }

    public Long addPaidWork(@Valid PaidWorkReq req) {
        Long userId = SecurityUtils.getOwnerID();
        User user = userService.getUserIfRegisteredOnlyId(userId);
        PaidWork paidWork = new PaidWork(user, req.getTitle(), req.getDescription(), req.getTags());
        return paidWorkRepository.save(paidWork).getId();
    }

    public void updatePaidWork(@Valid PaidWorkReq req, Long id) {
        Long userId = SecurityUtils.getOwnerID();
        PaidWork paidWork = getPaidWork(id);
        verifyPaidWorkForUpdateAndDelete(paidWork, userId);

        paidWork.setTitle(req.getTitle());
        paidWork.setDescription(req.getDescription());
        paidWork.setTags(req.getTags());

        paidWorkRepository.save(paidWork);
    }

    public void deletePaidWork(Long id) {
        Long userId = SecurityUtils.getOwnerID();
        PaidWork paidWork = getPaidWork(id);
        verifyPaidWorkForUpdateAndDelete(paidWork, userId);
        paidWorkRepository.delete(paidWork);
    }
}
