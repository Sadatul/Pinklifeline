package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.entities.Blog;
import com.sadi.pinklifeline.models.responses.BlogFullRes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long>, JpaSpecificationExecutor<Blog> {

    @Query("select new com.sadi.pinklifeline.models.responses.BlogFullRes(b.id, b.title, b.content, (select bv.id from BlogVote bv where bv.blog.id = :id and bv.user.id = :userId), b.author.userId, b.author.fullName, b.author.user.profilePicture, b.author.department, b.author.workplace, b.author.designation, b.upvoteCount, b.createdAt) from Blog b where b.id = :id")
    Optional<BlogFullRes> findBlogFullResById(Long id, Long userId);

    @Query("select b.id, b.author.fullName, b.author.user.username, b.title from Blog b where b.id = :id")
    Optional<Object[]> getBlogWithAuthorData(Long id);
}
