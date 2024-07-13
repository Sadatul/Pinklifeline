package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.responses.NearbyUserRes;
import com.sadi.pinklifeline.models.entities.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findById(Long id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("update User u set u.profilePicture = ?2 where u.id = ?1")
    void updateProfilePictureById(Long id, String path);

    @Query("select new com.sadi.pinklifeline.models.responses.NearbyUserRes(u.id, u.basicUser.fullName, u.patientSpecificDetails.location) " +
            "from User u where u.patientSpecificDetails.location in :locations and u.id <> :id")
    List<NearbyUserRes> findNearbyUsers(List<String> locations, Long id);

    @Query("select new User(u.id, u.isRegistrationComplete) from User u where u.id = :id")
    Optional<User> findByIdWithIsRegistrationComplete(Long id);

}
