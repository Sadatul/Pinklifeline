package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.enums.PaidWorkStatus;
import com.sadi.pinklifeline.enums.SubscriptionType;
import com.sadi.pinklifeline.enums.WorkTag;
import com.sadi.pinklifeline.exceptions.BadRequestFromUserException;
import com.sadi.pinklifeline.models.dtos.PaidWorkDTO;
import com.sadi.pinklifeline.models.entities.PaidWork;
import com.sadi.pinklifeline.models.reqeusts.PaidWorkReq;
import com.sadi.pinklifeline.service.EmailService;
import com.sadi.pinklifeline.service.PaidWorkHandlerService;
import com.sadi.pinklifeline.utils.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RequestMapping("/v1/works")
@RestController
@Slf4j
@RequiredArgsConstructor
public class PaidWorkHandlerV1 {
    private final PaidWorkHandlerService paidWorkHandlerService;
    private final EmailService emailService;

    @Value("${works.page-size}")
    private int pageSize;

    @PostMapping
    public ResponseEntity<Void> addPaidWork(@Valid @RequestBody PaidWorkReq req){
        log.debug("Add paid work req {}", req);
        Long id = paidWorkHandlerService.addPaidWork(req);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(id).toUri();
        return ResponseEntity.created(uri).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updatePaidWork(
            @PathVariable Long id,
            @Valid @RequestBody PaidWorkReq req){
        log.debug("update paid work req {}", req);
        paidWorkHandlerService.updatePaidWork(req, id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/finish")
    public ResponseEntity<Void> finishPaidWork(
            @PathVariable Long id){
        log.debug("finish paid work with id {}", id);
        Map<String, String> data = paidWorkHandlerService.finishPaidWork(id);
        emailService.sendSimpleEmail(data.get("username"),
                "Work marked as finished",
                String.format("The owner of work with title \"%s\" has marked the work as finished. Please check your account for more details.",data.get("title")));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaidWork(
            @PathVariable Long id){
        log.debug("delete paid work with id: {}", id);
        paidWorkHandlerService.deletePaidWork(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reserve")
    public ResponseEntity<Void> reservePaidWork(
            @PathVariable Long id){
        log.debug("Trying to reserve paid work with id: {}", id);
        Map<String, String> data = paidWorkHandlerService.reservePaidWork(id);
        emailService.sendSimpleEmail(data.get("username"),
                "A Doctor is Interested in Your Task",
                String.format("A doctor has shown interest in your task, \"%s\". Please check your account for more details.",data.get("title")));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/reserve")
    public ResponseEntity<Void> removeReserveFromPaidWork(
            @PathVariable Long id){
        log.debug("Remove reserve from paid work with id: {}", id);
        Map<String, String> data = paidWorkHandlerService.removeReserveFromWork(id);
        emailService.sendSimpleEmail(data.get("username"),
                "Task Reservation Canceled:",
                String.format("The user has canceled reservation on task, \"%s\". Please check your account for more details.",data.get("title")));
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<PagedModel<Map<String, Object>>> getPaidWorks(
            @RequestParam(required = false, defaultValue = "1000-01-01") LocalDate startDate,
            @RequestParam(required = false, defaultValue = "9999-12-31") LocalDate endDate,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) PaidWorkStatus status,
            @RequestParam(required = false) Long providerId,
            @RequestParam(required = false) String address,
            @RequestParam(required = false, defaultValue = "DESC") Sort.Direction sortDirection,
            @RequestParam(required = false, defaultValue = "0") Integer pageNo
    ){
        log.debug("Req to get paid works");
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(sortDirection, "createdAt"));
        Boolean isPaid = SecurityUtils.isSubscribedWithPackage(SubscriptionType.DOCTOR_MONTHLY, SubscriptionType.DOCTOR_YEARLY, SubscriptionType.DOCTOR_FREE_TRIAL);
        if(!isPaid && address != null){
            throw new BadRequestFromUserException("Address param is only available for paid users");
        }
        List<String> tagList = tags != null ?
                Arrays.asList(tags.split(",")) : new ArrayList<>();
        Specification<PaidWork> spec = paidWorkHandlerService.getSpecification(startDate.atStartOfDay(),
                endDate.atTime(23, 59), userId, providerId, address, tagList, status);
        Page<PaidWork> resPaidWork = paidWorkHandlerService.filterWorks(spec, pageable);
        Page<Map<String, Object>> res = convertPaidWorkPageToMapPage(resPaidWork, pageable, isPaid);
        return ResponseEntity.ok(new PagedModel<>(res));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPaidWork(
            @PathVariable Long id
    ){
        log.debug("Req to get paid work with id: {}", id);
        PaidWorkDTO dto = paidWorkHandlerService.getPaidWorkDTO(id);
        Map<String, Object> res = convertPaidWorkDTOtoMap(dto);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{id}/tags")
    public ResponseEntity<List<WorkTag>> getPaidWorkTags(
            @PathVariable Long id
    ){
        log.debug("Req to get paid work tags with id: {}", id);
        return ResponseEntity.ok(paidWorkHandlerService.getWorkTags(id));
    }

    private Map<String, Object> convertPaidWorkDTOtoMap(PaidWorkDTO dto) {
        Long userId = SecurityUtils.getOwnerID();
        Boolean isPaid = SecurityUtils.isSubscribedWithPackage(SubscriptionType.DOCTOR_MONTHLY,
                SubscriptionType.DOCTOR_YEARLY,
                SubscriptionType.DOCTOR_FREE_TRIAL);
        Map<String, Object> map = Stream.of(new Object[][]{
                {"id", dto.getId()},
                {"title", dto.getTitle()},
                {"description", dto.getDescription()},
                {"createdAt", dto.getCreatedAt()},
                {"tags", dto.getTags()},
                {"status", dto.getStatus()}
        }).collect(Collectors.toMap((data) -> (String) data[0], (data) -> data[1]));
        if(userId.equals(dto.getUserId()) || Objects.equals(userId, dto.getProviderId())){
            map.put("providerId", dto.getProviderId());
            map.put("providerName", dto.getProviderName());
            map.put("providerMail", dto.getProviderMail());
            map.put("providerContactNumber", dto.getProviderContactNumber());
            map.put("userId", dto.getUserId());
            map.put("userFullName", dto.getUserFullName());
            map.put("username", dto.getUsername());
            map.put("address", dto.getAddress());
        } else if(isPaid){
            map.put("address", dto.getAddress());
        }
        return map;
    }

    private Page<Map<String, Object>> convertPaidWorkPageToMapPage(Page<PaidWork> page, Pageable pageable, boolean isPaid) {
        List<Map<String, Object>> content = page.getContent().stream().map(
                (val) -> {
                    Map<String, Object> map = Stream.of(new Object[][]{
                            {"id", val.getId()},
                            {"title", val.getTitle()},
                            {"description", val.getDescription()},
                            {"createdAt", val.getCreatedAt()},
                            {"status", val.getStatus()}
                    }).collect(Collectors.toMap((data) -> (String) data[0], (data) -> data[1]));
                    if(isPaid) {
                        map.put("address", val.getAddress());
                    }
                    return map;
                }
        ).toList();
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }
}
