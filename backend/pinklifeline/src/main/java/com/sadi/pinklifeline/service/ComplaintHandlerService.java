package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.ComplaintResourceType;
import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.dtos.ComplaintDTO;
import com.sadi.pinklifeline.models.entities.Complaint;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.ComplaintReq;
import com.sadi.pinklifeline.repositories.BlogRepository;
import com.sadi.pinklifeline.repositories.ComplaintRepository;
import com.sadi.pinklifeline.repositories.forum.ForumAnswerRepository;
import com.sadi.pinklifeline.repositories.forum.ForumQuestionRepository;
import com.sadi.pinklifeline.specifications.ComplaintSpecification;
import com.sadi.pinklifeline.utils.SecurityUtils;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
public class ComplaintHandlerService {
	private final ComplaintRepository complaintRepository;
	private final UserService userService;
	private final BlogRepository blogRepository;
	private final ForumQuestionRepository forumQuestionRepository;
	private final ForumAnswerRepository forumAnswerRepository;
	private final EmailService emailService;

	@Value("${complaints.email.violation-not-found}")
	private String violationNotFoundEmailBody;
	@Value("${complaints.email.violation-found}")
	private String violationFoundEmailBody;
	@Value("${complaints.email.deleted-content}")
	private String deletedContentEmailBody;

	public ComplaintHandlerService(ComplaintRepository complaintRepository, UserService userService,
								   BlogRepository blogRepository, ForumQuestionRepository forumQuestionRepository,
								   ForumAnswerRepository forumAnswerRepository,EmailService emailService) {
		this.complaintRepository = complaintRepository;
		this.userService = userService;
		this.blogRepository = blogRepository;
		this.forumQuestionRepository = forumQuestionRepository;
		this.forumAnswerRepository = forumAnswerRepository;
		this.emailService = emailService;
	}

	public Long addComplaint(@Valid ComplaintReq req) {
		Long userId = SecurityUtils.getOwnerID();
		verifyResourceExists(req.getResourceId(), req.getType());
		User user = userService.getUserIfRegisteredOnlyId(userId);
		Complaint complaint = new Complaint(user, req.getResourceId(), req.getType(), req.getCategory(), req.getDescription());
		return complaintRepository.save(complaint).getId();
	}

	public void verifyResourceExists(Long resourceId, ComplaintResourceType type) {
		if(type.equals(ComplaintResourceType.BLOG)){
			if(blogRepository.existsById(resourceId)){
				return;
			}
		}
		else if(type.equals(ComplaintResourceType.FORUM_QUESTION)){
			if(forumQuestionRepository.existsById(resourceId)){
				return;
			}
		}
		else{
			if(forumAnswerRepository.existsById(resourceId)){
				return;
			}
		}
		throw new ResourceNotFoundException(String.format(
				"Resource with id %d and type %s not found", resourceId, type
		));
	}

	public Specification<Complaint> getSpecification(LocalDateTime startDate, LocalDateTime endDate,
													 String category, ComplaintResourceType type) {
		Specification<Complaint> spec = Specification.where(null);
		if (startDate != null && endDate != null) {
			spec = spec.and(ComplaintSpecification.withDateBetween(startDate, endDate));
		}
		if (category != null && !category.isEmpty()) {
			spec = spec.and(ComplaintSpecification.withCategory(category));
		}
		if (type != null) {
			spec = spec.and(ComplaintSpecification.withType(type.toString()));
		}
		return spec;
	}

	@PreAuthorize("hasRole('ADMIN')")
	public Page<Complaint> getComplaints(Specification<Complaint> spec, Pageable pageable) {
		return complaintRepository.findAll(spec, pageable);
	}

	@PreAuthorize("hasRole('ADMIN')")
	public void deleteResource(Long resourceId, ComplaintResourceType type) {
		if(type.equals(ComplaintResourceType.BLOG)){
			blogRepository.getBlogWithAuthorData(resourceId)
					.ifPresent((arr) -> {
						arr = (Object[]) arr[0];
						blogRepository.deleteById(resourceId);
						sendDeletedContentEmail((String) arr[2], (String) arr[1], type.toString().toLowerCase(), (String) arr[3]);
						});
		}
		else if(type.equals(ComplaintResourceType.FORUM_QUESTION)){
			forumQuestionRepository.getForumQuestionWithAuthorData(resourceId)
					.ifPresent((arr) -> {
						arr = (Object[]) arr[0];
						forumQuestionRepository.deleteById(resourceId);
						sendDeletedContentEmail((String) arr[2], (String) arr[1], type.toString().toLowerCase(), (String) arr[3]);
					});
		}
		else{
			forumAnswerRepository.getForumAnswerWithAuthorData(resourceId)
					.ifPresent((arr) -> {
						arr = (Object[]) arr[0];
						forumAnswerRepository.deleteById(resourceId);
						log.info("Email sent to {}", arr[2]);
						sendDeletedContentEmail((String) arr[2], (String) arr[1], type.toString().toLowerCase(), (String) arr[3]);
					});
		}
	}

	public ComplaintDTO getComplaintDTO(Long id) {
		return complaintRepository.getComplaintDTOById(id).orElseThrow(
				() -> new ResourceNotFoundException("Complaint with id " + id + " not found")
		);
	}

	public void sendViolationsNotFoundMail(String username, String fullName, String type) {
		emailService.sendSimpleEmail(username, "Review of Your Concern",
				String.format(violationNotFoundEmailBody, fullName, type));
	}

	public void sendViolationFoundMail(String username, String fullName, String type) {
		emailService.sendSimpleEmail(username, "Action Taken on Your Report",
				String.format(violationFoundEmailBody, fullName, type));
	}

	public void sendDeletedContentEmail(String username, String fullName, String type, String title) {
        String placeholder;
        if(type.equalsIgnoreCase("blog") || type.equalsIgnoreCase("forum_question")){
            placeholder = String.format("%s with title=%s", type, title);
        }
        else{
            placeholder = String.format("%s to question with title=%s", type, title);
        }
		emailService.sendSimpleEmail(username, "Your Content Has Been Removed",
				String.format(deletedContentEmailBody, fullName, placeholder));
	}

	public void deleteComplaintById(Long id){
		complaintRepository.deleteById(id);
	}
}
