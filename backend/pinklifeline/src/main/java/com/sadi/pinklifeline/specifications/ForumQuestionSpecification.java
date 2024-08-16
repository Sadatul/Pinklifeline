package com.sadi.pinklifeline.specifications;

import com.sadi.pinklifeline.models.entities.ForumQuestion;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class ForumQuestionSpecification {
    public static Specification<ForumQuestion> withTitle(String title) {
        return (root, query, cb) -> {
            if (title != null && !title.isEmpty()) {
                return cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
            }
            return null;
        };
    }

    public static Specification<ForumQuestion> withDateBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, cb) -> {
            if (startDate != null && endDate != null) {
                return cb.between(root.get("createdAt"), startDate, endDate);
            }
            return null;
        };
    }

    public static Specification<ForumQuestion> withTags(List<String> tags) {
        return (root, query, cb) -> {
            if (tags != null && !tags.isEmpty()) {
                List<String> lowercaseTags = tags.stream()
                        .map(String::toLowerCase)
                        .collect(Collectors.toList());

                Subquery<Long> subquery = query.subquery(Long.class);
                Root<ForumQuestion> subRoot = subquery.correlate(root);
                Join<ForumQuestion, String> tagJoin = subRoot.join("tags");

                subquery.select(cb.countDistinct(tagJoin))
                        .where(cb.lower(tagJoin).in(lowercaseTags));

                return cb.equal(subquery, (long) tags.size());
            }
            return null;
        };
    }

    public static Specification<ForumQuestion> withUserId(Long userId) {
        return (root, query, cb) -> {
            if (userId != null) {
                return cb.equal(root.get("user").get("id"), userId);
            }
            return null;
        };
    }

    public static Specification<ForumQuestion> sortByTimestamp(Sort.Direction direction) {
        return (root, query, cb) -> {
            query.orderBy(direction == Sort.Direction.ASC ?
                    cb.asc(root.get("createdAt")) :
                    cb.desc(root.get("createdAt")));
            return null; // sorting doesn't affect the where clause
        };
    }

    public static Specification<ForumQuestion> sortByVote(Sort.Direction direction) {
        return (root, query, cb) -> {
            query.orderBy(direction == Sort.Direction.ASC ?
                    cb.asc(root.get("voteCount")) :
                    cb.desc(root.get("voteCount")));
            return null; // sorting doesn't affect the where clause
        };
    }
}
