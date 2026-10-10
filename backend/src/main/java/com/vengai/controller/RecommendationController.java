package com.vengai.controller;

import com.vengai.model.Recommendation;
import com.vengai.repository.RecommendationRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationRepository recRepo;

    public RecommendationController(RecommendationRepository recRepo) { this.recRepo = recRepo; }

    @GetMapping("")
    public ResponseEntity<List<Map<String, Object>>> get(
            @RequestParam(required = false) String batch_id,
            @RequestParam(defaultValue = "10") int limit) {
        List<Recommendation> recs;
        if (batch_id != null) {
            recs = recRepo.findByBatchIdAndIsActiveTrueOrderByCreatedAtDesc(batch_id, PageRequest.of(0, limit));
        } else {
            recs = recRepo.findByIsActiveTrueOrderByCreatedAtDesc(PageRequest.of(0, limit));
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Recommendation r : recs) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.getId()); m.put("batch_id", r.getBatchId()); m.put("priority", r.getPriority());
            m.put("category", r.getCategory()); m.put("title", r.getTitle()); m.put("message", r.getMessage());
            m.put("action", r.getAction()); m.put("created_at", r.getCreatedAt());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }
}
