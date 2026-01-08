package com.example.locc.domain.department.entity;

import com.example.locc.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "department_boards")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DepartmentBoard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false)
    private Integer viewCount = 0;

    @Column(nullable = false)
    private Boolean isPinned = false;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // 정적 팩토리 메서드
    public static DepartmentBoard create(Department department, String title, String content, User author) {
        DepartmentBoard board = new DepartmentBoard();
        board.department = department;
        board.title = title;
        board.content = content;
        board.author = author;
        return board;
    }

    // 수정
    public void update(String title, String content) {
        this.title = title;
        this.content = content;
    }

    // 조회수 증가
    public void incrementViewCount() {
        this.viewCount++;
    }

    // 고정/해제
    public void togglePin() {
        this.isPinned = !this.isPinned;
    }

    // 권한 체크
    public boolean canModify(User user) {
        return this.author.getId().equals(user.getId()) || user.isAdmin();
    }
}
