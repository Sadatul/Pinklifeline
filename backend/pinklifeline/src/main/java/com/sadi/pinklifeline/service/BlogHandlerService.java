package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.entities.Blog;
import com.sadi.pinklifeline.models.entities.BlogVote;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.BlogReq;
import com.sadi.pinklifeline.repositories.BlogRepository;
import com.sadi.pinklifeline.repositories.BlogVoteRepository;
import com.sadi.pinklifeline.service.doctor.DoctorsInfoService;
import com.sadi.pinklifeline.utils.SecurityUtils;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class BlogHandlerService {
    final private BlogRepository blogRepository;
    final private BlogVoteRepository blogVoteRepository;
    final private DoctorsInfoService doctorsInfoService;
    final private UserService userService;

    public BlogHandlerService(BlogRepository blogRepository, BlogVoteRepository blogVoteRepository, DoctorsInfoService doctorsInfoService, UserService userService) {
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
        Optional<BlogVote> voteEntry = blogVoteRepository.findByBlogIdAndUserId(id, voterId);
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
}
