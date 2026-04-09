package com.example.demo.repository;

import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    // Số lượng người dùng mới theo ngày (7 ngày gần nhất)
    @Query("SELECT FUNCTION('DATE', u.createdAt), COUNT(u) " +
           "FROM User u " +
           "WHERE u.createdAt >= :startDate " +
           "GROUP BY FUNCTION('DATE', u.createdAt) " +
           "ORDER BY FUNCTION('DATE', u.createdAt) ASC")
    List<Object[]> getDailyNewUsers(@Param("startDate") LocalDateTime startDate);
}
