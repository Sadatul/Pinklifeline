package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.BlogSortType;
import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.entities.*;
import com.sadi.pinklifeline.models.reqeusts.BlogReq;
import com.sadi.pinklifeline.models.responses.BlogsRes;
import com.sadi.pinklifeline.repositories.BlogRepository;
import com.sadi.pinklifeline.repositories.BlogVoteRepository;
import com.sadi.pinklifeline.service.doctor.DoctorsInfoService;
import com.sadi.pinklifeline.specifications.BlogSpecification;
import com.sadi.pinklifeline.utils.SecurityUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class BlogHandlerService {
    final private BlogRepository blogRepository;
    final private BlogVoteRepository blogVoteRepository;
    final private DoctorsInfoService doctorsInfoService;
    final private UserService userService;

    @PersistenceContext
    private EntityManager entityManager;

    @Value("${blogs.short-content.size}")
    private int shortContentSize;


    public BlogHandlerService(BlogRepository blogRepository, BlogVoteRepository blogVoteRepository,
                              DoctorsInfoService doctorsInfoService, UserService userService) {
        this.blogRepository = blogRepository;
        this.blogVoteRepository = blogVoteRepository;
        this.doctorsInfoService = doctorsInfoService;
        this.userService = userService;
    }

    public Blog getBlog(Long id){
        return blogRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                String.format("Blog with id %s not found", id)
                )
        );
    }

    public void verifyBlogOwner(Blog blog, Long doctorId){
        if (!Objects.equals(blog.getAuthor().getUserId(), doctorId)) {
            throw new AuthorizationDeniedException(
                    String.format("Doctor with id:%d doesn't have access to the blog: %d"
                            , doctorId, blog.getId()),
                    () -> false);
        }
    }

    @PreAuthorize("hasRole('DOCTOR')")
    public Long addBlog(BlogReq req){
        Long userId = SecurityUtils.getOwnerID();
        DoctorDetails doctor = doctorsInfoService.getDoctorIfVerified(userId);
        Blog blog = new Blog(doctor, req.getTitle(), req.getContent());
        return blogRepository.save(blog).getId();
    }

    @PreAuthorize("hasRole('DOCTOR')")
    public void updateBlog(BlogReq req, Long id) {
        Long userId = SecurityUtils.getOwnerID();
        Blog blog = getBlog(id);
        verifyBlogOwner(blog, userId);

        blog.setTitle(req.getTitle());
        blog.setContent(req.getContent());

        blogRepository.save(blog);
    }

    @PreAuthorize("hasRole('DOCTOR')")
    public void deleteBlog(Long id) {
        Long userId = SecurityUtils.getOwnerID();
        Blog blog = getBlog(id);
        verifyBlogOwner(blog, userId);
        blogRepository.delete(blog);
    }

    public void voteBlog(Long id) {
        Long voterId = SecurityUtils.getOwnerID();
        Blog blog = getBlog(id);
        User user = userService.getUserIfRegisteredOnlyId(voterId);
        Optional<BlogVote> voteEntry = getVoteEntryForBlog(id, voterId);
        Integer voteCount = blog.getUpvoteCount();
        if(voteEntry.isPresent()){
            blogVoteRepository.delete(voteEntry.get());
            voteCount--;
        }
        else{
            BlogVote vote = new BlogVote(blog, user);
            blogVoteRepository.save(vote);
            voteCount++;
        }
        blog.setUpvoteCount(voteCount);
        blogRepository.save(blog);
    }

    public Optional<BlogVote> getVoteEntryForBlog(Long id, Long voterId) {
        return blogVoteRepository.findByBlogIdAndUserId(id, voterId);
    }

    public Page<BlogsRes> filterBlogs(Specification<Blog> spec, Pageable pageable){
        Long userId = SecurityUtils.getOwnerID();
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<BlogsRes> cq = cb.createQuery(BlogsRes.class);

        Root<Blog> root = cq.from(Blog.class);
        Subquery<Long> voteIdSubQuery = cq.subquery(Long.class);
        Root<BlogVote> blogVoteRoot = voteIdSubQuery.from(BlogVote.class);

        voteIdSubQuery.select(blogVoteRoot.get("id"));
        voteIdSubQuery.where(
                cb.equal(blogVoteRoot.get("blog").get("id"), root.get("id")),
                cb.equal(blogVoteRoot.get("user").get("id"), userId)
        );

        List<Predicate> predicates = new ArrayList<>();
        if (spec != null) {
            Predicate specPredicate = spec.toPredicate(root, cq, cb);
            if (specPredicate != null) {
                predicates.add(specPredicate);
            }
        }
        cq.where(predicates.toArray(new Predicate[0]));

        cq.select(cb.construct(BlogsRes.class,
                root.get("id"),
                root.get("title"),
                cb.substring(root.get("content"), 1, shortContentSize),
                voteIdSubQuery.alias("voteId"),
                root.get("author").get("fullName"),
                root.get("author").get("userId"),
                root.get("upvoteCount"),
                root.get("createdAt")
        ));

        TypedQuery<BlogsRes> query = entityManager.createQuery(cq);
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());

        List<BlogsRes> result =  query.getResultList();
        assert spec != null;
        long total = blogRepository.count(spec);
        return new PageImpl<>(result, pageable, total);
    }

    public Specification<Blog> getSpecification(LocalDateTime startDate, LocalDateTime endDate,
                                                Long docId, String title, String doctorName,
                                                BlogSortType sortType, Sort.Direction sortDirection) {
        Specification<com.sadi.pinklifeline.models.entities.Blog> spec = Specification.where(null);
        if (startDate != null && endDate != null) {
            spec = spec.and(BlogSpecification.withDateBetween(startDate, endDate));
        }
        if (title != null && !title.isEmpty()) {
            spec = spec.and(BlogSpecification.withTitle(title));
        }
        if (docId != null) {
            spec = spec.and(BlogSpecification.withDocId(docId));
        }
        if (doctorName != null && !doctorName.isEmpty()) {
            spec = spec.and(BlogSpecification.withDoctorNameLike(doctorName));
        }
        if(sortType.equals(BlogSortType.VOTES)){
            spec = spec.and(BlogSpecification.sortByVote(sortDirection));
        }
        else{
            spec = spec.and(BlogSpecification.sortByTimestamp(sortDirection));
        }
        return spec;
    }

    public Blog getBlogWithAuthor(Long id) {
        return blogRepository.findBLogWithAuthorById(id).orElseThrow(() -> new ResourceNotFoundException(
                String.format("Blog with id %s not found", id)
            )
        );
    }
}
