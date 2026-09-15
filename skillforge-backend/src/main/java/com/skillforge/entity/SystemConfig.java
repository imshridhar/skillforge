package com.skillforge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "system_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "config_id")
    private UUID configId;

    @Column(nullable = false)
    @Builder.Default
    private Double adaptationSensitivity = 0.75;

    @Column(nullable = false)
    @Builder.Default
    private Double llmTemperature = 0.4;

    @Column(nullable = false, length = 100)
    @Builder.Default
    private String contentModel = "GPT-4 (Recommended)";

    @Column(nullable = false)
    @Builder.Default
    private Boolean autoRemediation = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean strictProctoring = false;

    @Column(length = 20)
    @Builder.Default
    private String appVersion = "v2.4.0-beta";

    @Column(length = 20)
    @Builder.Default
    private String environment = "Production";

    @Column(length = 20)
    @Builder.Default
    private String region = "us-east-1";

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
