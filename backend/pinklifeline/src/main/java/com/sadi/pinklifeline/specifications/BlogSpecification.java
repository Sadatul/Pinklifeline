package com.sadi.pinklifeline.specifications;

import com.sadi.pinklifeline.models.entities.Blog;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class BlogSpecification {
    public static Specification<Blog> withTitle(String title) {
        return (root, query, cb) -> {
            if (title != null && !title.isEmpty()) {
                return cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
            }
            return null;
        };
    }

    public static Specification<Blog> withDateBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, cb) -> {
            if (startDate != null && endDate != null) {
                return cb.between(root.get("createdAt"), startDate, endDate);
            }
            return null;
        };
    }

    public static Specification<Blog> withDocId(Long docId) {
        return (root, query, cb) -> {
            if (docId != null) {
                return cb.equal(root.get("author").get("userId"), docId);
            }
            return null;
        };
    }

    public static Specification<Blog> withDoctorNameLike(String doctorName) {
        return (root, query, cb) -> {
            if (doctorName != null && !doctorName.isEmpty()) {
                return cb.like(cb.lower(root.get("author").get("fullName")), "%" + doctorName.toLowerCase() + "%");
            }
            return null;
        };
    }

    public static Specification<Blog> sortByTimestamp(Sort.Direction direction) {
        return (root, query, cb) -> {
            query.orderBy(direction == Sort.Direction.ASC ?
                    cb.asc(root.get("createdAt")) :
                    cb.desc(root.get("createdAt")));
            return null; // sorting doesn't affect the where clause
        };
    }

    public static Specification<Blog> sortByVote(Sort.Direction direction) {
        return (root, query, cb) -> {
            query.orderBy(direction == Sort.Direction.ASC ?
                    cb.asc(root.get("upvoteCount")) :
                    cb.desc(root.get("upvoteCount")));
            return null; // sorting doesn't affect the where clause
        };
    }
}
