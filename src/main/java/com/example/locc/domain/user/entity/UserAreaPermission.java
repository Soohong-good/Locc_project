package com.example.locc.domain.user.entity;

import com.example.locc.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * 사용자 영역별 작성 권한
 * - 관리자/운영자가 일반 사용자에게 특정 영역 작성 권한을 부여
 * - 1 row = 1 area 작성 권한
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
    name = "user_area_permissions",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "area"})
)
public class UserAreaPermission extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AreaType area;

    @Column(name = "granted_by")
    private UUID grantedBy; // 권한 부여한 관리자 ID

    public static UserAreaPermission grant(User user, AreaType area, UUID grantedBy) {
        UserAreaPermission p = new UserAreaPermission();
        p.user = user;
        p.area = area;
        p.grantedBy = grantedBy;
        return p;
    }
}
