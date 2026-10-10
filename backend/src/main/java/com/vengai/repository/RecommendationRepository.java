package com.vengai.repository;
import com.vengai.model.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import java.util.List;
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
    List<Recommendation> findByBatchIdAndIsActiveTrueOrderByCreatedAtDesc(String batchId, Pageable pageable);
    List<Recommendation> findByBatchIdAndIsActiveTrue(String batchId);
    List<Recommendation> findByIsActiveTrue();
}
