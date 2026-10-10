package com.vengai.controller;

import com.vengai.dto.StorageBatchCreateRequest;
import com.vengai.dto.StorageBatchUpdateRequest;
import com.vengai.model.StorageBatch;
import com.vengai.repository.StorageBatchRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/storage/batches")
public class StorageBatchController {

    private final StorageBatchRepository batchRepo;

    public StorageBatchController(StorageBatchRepository batchRepo) {
        this.batchRepo = batchRepo;
    }

    private Map<String, Object> enrich(StorageBatch b) {
        LocalDate today = LocalDate.now();
        int storageDays = (int) Math.max(0, today.toEpochDay() - b.getStorageStartDate().toEpochDay());
        Integer daysRemaining = b.getExpectedRetrievalDate() != null ? (int)(b.getExpectedRetrievalDate().toEpochDay() - today.toEpochDay()) : null;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", b.getId()); m.put("batch_id", b.getBatchId()); m.put("onion_variety", b.getOnionVariety());
        m.put("initial_weight", b.getInitialWeight()); m.put("storage_start_date", b.getStorageStartDate().toString());
        m.put("expected_retrieval_date", b.getExpectedRetrievalDate() != null ? b.getExpectedRetrievalDate().toString() : null);
        m.put("location", b.getLocation()); m.put("warehouse", b.getWarehouse()); m.put("notes", b.getNotes());
        m.put("is_active", b.getIsActive()); m.put("created_at", b.getCreatedAt());
        m.put("storage_days", storageDays); m.put("days_remaining", daysRemaining);
        return m;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody StorageBatchCreateRequest req) {
        if (batchRepo.existsByBatchId(req.getBatchId()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Storage batch '" + req.getBatchId() + "' already exists.");
        StorageBatch batch = StorageBatch.builder()
            .batchId(req.getBatchId()).onionVariety(req.getOnionVariety())
            .initialWeight(req.getInitialWeight()).storageStartDate(req.getStorageStartDate())
            .expectedRetrievalDate(req.getExpectedRetrievalDate()).location(req.getLocation())
            .warehouse(req.getWarehouse()).notes(req.getNotes()).isActive(true).build();
        batchRepo.save(batch);
        return ResponseEntity.status(HttpStatus.CREATED).body(enrich(batch));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(@RequestParam(defaultValue = "false") boolean active_only) {
        List<StorageBatch> batches = active_only ? batchRepo.findByIsActiveTrueOrderByCreatedAtDesc() : batchRepo.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> result = new ArrayList<>();
        for (StorageBatch b : batches) result.add(enrich(b));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{batchId}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable String batchId) {
        return batchRepo.findByBatchId(batchId)
            .map(b -> ResponseEntity.ok(enrich(b)))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Storage batch '" + batchId + "' not found."));
    }

    @PutMapping("/{batchId}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable String batchId, @RequestBody StorageBatchUpdateRequest req) {
        StorageBatch batch = batchRepo.findByBatchId(batchId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Storage batch '" + batchId + "' not found."));
        if (req.getOnionVariety() != null) batch.setOnionVariety(req.getOnionVariety());
        if (req.getInitialWeight() != null) batch.setInitialWeight(req.getInitialWeight());
        if (req.getStorageStartDate() != null) batch.setStorageStartDate(req.getStorageStartDate());
        if (req.getExpectedRetrievalDate() != null) batch.setExpectedRetrievalDate(req.getExpectedRetrievalDate());
        if (req.getLocation() != null) batch.setLocation(req.getLocation());
        if (req.getWarehouse() != null) batch.setWarehouse(req.getWarehouse());
        if (req.getNotes() != null) batch.setNotes(req.getNotes());
        if (req.getIsActive() != null) batch.setIsActive(req.getIsActive());
        batchRepo.save(batch);
        return ResponseEntity.ok(enrich(batch));
    }

    @DeleteMapping("/{batchId}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable String batchId) {
        StorageBatch batch = batchRepo.findByBatchId(batchId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Storage batch '" + batchId + "' not found."));
        batchRepo.delete(batch);
        return ResponseEntity.ok(Map.of("success", true, "message", "Storage batch '" + batchId + "' was successfully deleted."));
    }
}
