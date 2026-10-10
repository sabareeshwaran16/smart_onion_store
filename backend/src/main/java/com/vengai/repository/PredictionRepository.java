package com.vengai.repository;
import com.vengai.model.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    Optional<Prediction> findTopByBatchIdOrderByPredictionTimeDesc(String batchId);
    List<Prediction> findByBatchIdOrderByPredictionTimeAsc(String batchId);
}
