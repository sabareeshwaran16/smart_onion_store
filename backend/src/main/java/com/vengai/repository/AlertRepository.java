package com.vengai.repository;
import com.vengai.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByIsResolvedOrderByCreatedAtDesc(boolean resolved, Pageable pageable);
    Optional<Alert> findTopByAlertTypeAndBatchIdAndIsResolvedFalse(String alertType, String batchId);
    List<Alert> findByIsResolvedFalseOrderByCreatedAtDesc();
}
