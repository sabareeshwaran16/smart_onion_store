package com.vengai.repository;
import com.vengai.model.PredictionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import java.util.List;
public interface PredictionHistoryRepository extends JpaRepository<PredictionHistory, Long> {
    List<PredictionHistory> findByBatchIdOrderByRecordedAtAsc(String batchId, Pageable pageable);
}
