package com.example.locc.domain.user.repository;

import com.example.locc.domain.user.entity.AreaType;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.entity.UserAreaPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserAreaPermissionRepository extends JpaRepository<UserAreaPermission, Long> {

    List<UserAreaPermission> findByUser(User user);

    @Query("SELECT p.area FROM UserAreaPermission p WHERE p.user.id = :userId")
    List<AreaType> findAreasByUserId(@Param("userId") UUID userId);

    Optional<UserAreaPermission> findByUserAndArea(User user, AreaType area);

    boolean existsByUserAndArea(User user, AreaType area);

    void deleteByUserAndArea(User user, AreaType area);
}
