package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.PaidWorkStatus;
import com.sadi.pinklifeline.enums.WorkTag;
import com.sadi.pinklifeline.exceptions.BadRequestFromUserException;
import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.dtos.PaidWorkDTO;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.models.entities.PaidWork;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.PaidWorkReq;
import com.sadi.pinklifeline.repositories.DoctorDetailsRepository;
import com.sadi.pinklifeline.repositories.PaidWorkRepository;
import com.sadi.pinklifeline.service.doctor.DoctorsInfoService;
import com.sadi.pinklifeline.specifications.PaidWorkSpecification;
import com.sadi.pinklifeline.utils.SecurityUtils;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
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
    private final DoctorDetailsRepository doctorDetailsRepository;

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
        PaidWork paidWork = new PaidWork(user, req.getTitle(), req.getDescription(), req.getAddress() ,req.getTags());
        return paidWorkRepository.save(paidWork).getId();
    }

    public void updatePaidWork(@Valid PaidWorkReq req, Long id) {
        Long userId = SecurityUtils.getOwnerID();
        PaidWork paidWork = getPaidWork(id);
        verifyPaidWorkForUpdateAndDelete(paidWork, userId);

        paidWork.setTitle(req.getTitle());
        paidWork.setDescription(req.getDescription());
        paidWork.setAddress(req.getAddress());
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

    public Specification<PaidWork> getSpecification(LocalDateTime startDate, LocalDateTime endDate,
                                                    Long userId, Long providerId, String address, List<String> tags,
                                                    PaidWorkStatus status) {
        Specification<PaidWork> spec = Specification.where(null);

        if (startDate != null && endDate != null) {
            spec = spec.and(PaidWorkSpecification.withDateBetween(startDate, endDate));
        }
        if (status != null) {
           spec = spec.and(PaidWorkSpecification.withStatus(status));
        }
        if (address != null && !address.isEmpty()) {
            spec = spec.and(PaidWorkSpecification.withAddress(address));
        }
        if (tags != null && !tags.isEmpty()) {
            spec = spec.and(PaidWorkSpecification.withTags(tags));
        }
        if (userId != null) {
            spec = spec.and(PaidWorkSpecification.withUserId(userId));
        }
        if (providerId != null) {
            spec = spec.and(PaidWorkSpecification.withProviderId(providerId));
        }
        return spec;
    }

    public Page<PaidWork> filterWorks(Specification<PaidWork> spec, Pageable pageable) {
        return paidWorkRepository.findAll(spec, pageable);

    }

    public PaidWorkDTO getPaidWorkDTO(Long id) {
         var dto = paidWorkRepository.findPaidWorkDTOById(id).orElseThrow(() -> new ResourceNotFoundException(
                String.format("PaidWork with id %s not found", id)
        ));
         dto.setTags(paidWorkRepository.findWorkTagsById(id));
         if(!dto.getStatus().equals(PaidWorkStatus.POSTED)){
             String[] docInfo = doctorDetailsRepository.getDocContactInfoById(dto.getProviderId()).getFirst();
             if(docInfo.length != 3){
                 log.info("Paid work provider info: {}", docInfo.length);
                 return dto;
             }
             dto.setProviderMail(docInfo[1]);
             dto.setProviderName(docInfo[0]);
             dto.setProviderContactNumber(docInfo[2]);
         }
         return dto;
    }

    public List<WorkTag> getWorkTags(Long id) {
        return paidWorkRepository.findWorkTagsById(id);
    }
}
