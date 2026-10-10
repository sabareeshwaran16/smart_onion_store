package com.vengai.repository;
import com.vengai.model.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {
    Optional<SensorReading> findTopByDeviceIdOrderByTimestampDesc(String deviceId);
    Optional<SensorReading> findTopByOrderByTimestampDesc();
    List<SensorReading> findByDeviceIdAndTimestampAfterOrderByTimestampAsc(String deviceId, OffsetDateTime after);
    List<SensorReading> findByBatchIdOrderByTimestampDesc(String batchId);
    List<SensorReading> findByTimestampAfterOrderByTimestampAsc(OffsetDateTime after);
}
