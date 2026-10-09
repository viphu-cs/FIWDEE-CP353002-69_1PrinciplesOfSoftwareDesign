package com.fiwdee.repository;

import com.fiwdee.domain.entity.User;
import com.fiwdee.domain.enums.UserRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByPhoneNumber(String phoneNumber);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    /** Uniqueness checks scoped to "taken by someone other than id" (self-update keeps own values). */
    Optional<User> findByEmailAndIdNot(String email, Long id);

    Optional<User> findByPhoneNumberAndIdNot(String phoneNumber, Long id);

    List<User> findByRole(UserRole role);

    @Query(value = "SELECT u FROM User u WHERE "
            + "(:role IS NULL OR u.role = :role) AND "
            + "(CAST(:search AS string) IS NULL OR ("
            + "    LOWER(u.fullName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) "
            + "    OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) "
            + "    OR LOWER(u.phoneNumber) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) "
            + "    OR LOWER(u.username) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))"
            + "))",
            countQuery = "SELECT count(u) FROM User u WHERE "
            + "(:role IS NULL OR u.role = :role) AND "
            + "(CAST(:search AS string) IS NULL OR ("
            + "    LOWER(u.fullName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) "
            + "    OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) "
            + "    OR LOWER(u.phoneNumber) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) "
            + "    OR LOWER(u.username) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))"
            + "))")
    Page<User> findUsersPage(
            @Param("role") UserRole role,
            @Param("search") String search,
            Pageable pageable);
}
