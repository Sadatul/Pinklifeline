package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.PaidWorkStatus;
import com.sadi.pinklifeline.exceptions.BadRequestFromUserException;
import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.models.entities.PaidWork;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.PaidWorkReq;
import com.sadi.pinklifeline.repositories.PaidWorkRepository;
import com.sadi.pinklifeline.service.doctor.DoctorsInfoService;
import com.sadi.pinklifeline.utils.SecurityUtils;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaidWorkHandlerService {
    private final PaidWorkRepository paidWorkRepository;
    private final UserService userService;
    private final DoctorsInfoService doctorsInfoService;

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

    private PaidWork getPaidWorkWithLock(Long id) {
        return paidWorkRepository.findWithLockingById(id).orElseThrow(() -> new ResourceNotFoundException(
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

    @Transactional
    public Map<String, String> reservePaidWork(Long id) {
        Long userId = SecurityUtils.getOwnerID();
        DoctorDetails doctor = doctorsInfoService.getDoctorIfVerified(userId);

        PaidWork paidWork = getPaidWorkWithLock(id);
        if(!Objects.equals(paidWork.getStatus(), PaidWorkStatus.POSTED)){
            throw new BadRequestFromUserException(
                    String.format("Work with status %s can't be reserved", paidWork.getStatus())
            );
        }
        paidWork.setStatus(PaidWorkStatus.ACCEPTED);
        paidWork.setHealCareProvider(doctor);

        String username = userService.getUsernameById(paidWork.getUser().getId());
        return Stream.of(new Object[][]{
                {"username", username},
                {"title", paidWork.getTitle()},
                {"description", paidWork.getDescription()},
        }).collect(Collectors.toMap((val) -> (String) val[0], (val) -> (String) val[1]));
    }

    @Transactional
    public Map<String, String> removeReserveFromWork(Long id) {
        Long userId = SecurityUtils.getOwnerID();
        PaidWork paidWork = getPaidWorkWithLock(id);
        if(!Objects.equals(paidWork.getStatus(), PaidWorkStatus.ACCEPTED)){
            throw new BadRequestFromUserException(
                    String.format("Can't remove reserve from work with status %s", paidWork.getStatus())
            );
        }
        if(!Objects.equals(paidWork.getUser().getId(), userId) &&
                !Objects.equals(paidWork.getHealCareProvider().getUserId(), userId)){
            throw new AuthorizationDeniedException(
                    String.format("User with id:%d doesn't have access to the paidWork with id: %d"
                            , userId, id),
                    () -> false);
        }

        String username = Objects.equals(paidWork.getUser().getId(), userId) ?
                userService.getUsernameById(paidWork.getHealCareProvider().getUserId()) :
                userService.getUsernameById(paidWork.getUser().getId());

        paidWork.setHealCareProvider(null);
        paidWork.setStatus(PaidWorkStatus.POSTED);


        return Stream.of(new Object[][]{
                {"username", username},
                {"title", paidWork.getTitle()},
                {"description", paidWork.getDescription()},
        }).collect(Collectors.toMap((val) -> (String) val[0], (val) -> (String) val[1]));
    }
}
