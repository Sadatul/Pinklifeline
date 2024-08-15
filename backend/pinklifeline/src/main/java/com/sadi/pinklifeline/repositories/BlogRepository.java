package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.entities.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long>, JpaSpecificationExecutor<Blog> {
    @Query("select b from Blog b join fetch b.author where b.id=:id")
    Optional<Blog> findBLogWithAuthorById(Long id);
}
