package com.example.locc.repository;

import com.example.locc.entity.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    /**
     * 삭제되지 않은 활성 사용자 조회
     */
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.isDeleted = false")
    Optional<User> findActiveByEmail(@Param("email") String email);
}