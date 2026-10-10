package com.vengai.repository;
import com.vengai.model.FanLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import java.util.List;
public interface FanLogRepository extends JpaRepository<FanLog, Long> {
    List<FanLog> findByDeviceIdOrderByCreatedAtDesc(String deviceId, Pageable pageable);
}
