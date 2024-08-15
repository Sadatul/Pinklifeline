package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.enums.BlogSortType;
import com.sadi.pinklifeline.models.entities.Blog;
import com.sadi.pinklifeline.models.reqeusts.BlogReq;
import com.sadi.pinklifeline.models.responses.BlogsRes;
import com.sadi.pinklifeline.service.BlogHandlerService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;

@RestController
@RequestMapping("/v1/blogs")
@Slf4j
public class BlogHandlerV1 {

    @Value("${blogs.page-size}")
    private int blogPageSize;

    final private BlogHandlerService blogHandlerService;

    public BlogHandlerV1(BlogHandlerService blogHandlerService) {
        this.blogHandlerService = blogHandlerService;
    }

    @PostMapping
    public ResponseEntity<Void> createBlog(@Valid @RequestBody BlogReq req){
        log.debug("Add blog req {}", req);
        Long id = blogHandlerService.addBlog(req);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(id).toUri();
        return ResponseEntity.created(uri).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateBlog(
            @PathVariable Long id,
            @Valid @RequestBody BlogReq req){
        log.debug("update blog req {}", req);
        blogHandlerService.updateBlog(req, id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/vote")
    public ResponseEntity<Void> voteBlog(
            @PathVariable Long id){
        log.debug("vote for blog with id: {}", id);
        blogHandlerService.voteBlog(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlog(
            @PathVariable Long id){
        log.debug("delete blog with id: {}", id);
        blogHandlerService.deleteBlog(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<PagedModel<BlogsRes>> getBlogs(
            @RequestParam(required = false, defaultValue = "1000-01-01") LocalDate startDate,
            @RequestParam(required = false, defaultValue = "9999-12-31") LocalDate endDate,
            @RequestParam(required = false) Long docId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String doctorName,
            @RequestParam(required = false, defaultValue = "TIME") BlogSortType sortType,
            @RequestParam(required = false, defaultValue = "DESC") Sort.Direction sortDirection,
            @RequestParam(required = false, defaultValue = "0") Integer pageNo
    ){
        log.debug("Req to get blogs");
        Pageable pageable = PageRequest.of(pageNo, blogPageSize);
        Specification<Blog> spec = blogHandlerService.getSpecification(startDate.atStartOfDay(),
                endDate.atTime(23, 59), docId, title,
                doctorName, sortType, sortDirection);
        Page<BlogsRes> res = blogHandlerService.filterBlogs(spec, pageable);
        return ResponseEntity.ok(new PagedModel<>(res));
    }
}
