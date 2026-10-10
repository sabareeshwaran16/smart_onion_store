package com.vengai.repository;
import com.vengai.model.StorageBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface StorageBatchRepository extends JpaRepository<StorageBatch, Long> {
    Optional<StorageBatch> findByBatchId(String batchId);
    List<StorageBatch> findByIsActiveTrueOrderByCreatedAtDesc();
    List<StorageBatch> findAllByOrderByCreatedAtDesc();
    boolean existsByBatchId(String batchId);
}
