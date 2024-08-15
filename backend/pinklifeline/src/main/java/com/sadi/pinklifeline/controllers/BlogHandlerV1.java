package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.models.reqeusts.BlogReq;
import com.sadi.pinklifeline.service.BlogHandlerService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/v1/blogs")
@Slf4j
public class BlogHandlerV1 {
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
}
