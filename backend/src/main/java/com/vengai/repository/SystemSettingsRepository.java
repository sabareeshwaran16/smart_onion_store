package com.vengai.repository;
import com.vengai.model.SystemSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface SystemSettingsRepository extends JpaRepository<SystemSettings, Long> {
    Optional<SystemSettings> findByKey(String key);
    boolean existsByKey(String key);
}
