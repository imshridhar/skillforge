package com.skillforge.service;

import com.skillforge.dto.request.CourseContentRequest;
import com.skillforge.dto.request.CourseModuleRequest;
import com.skillforge.dto.response.CourseContentResponse;
import com.skillforge.dto.response.CourseModuleResponse;
import com.skillforge.entity.LearningContent;
import com.skillforge.entity.LearningGoal;
import com.skillforge.repository.LearningContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class CourseStructureService {

    private final LearningContentRepository learningContentRepository;

    @Transactional
    public void replaceCourseStructure(LearningGoal goal, List<CourseModuleRequest> modules) {
        List<LearningContent> existing = learningContentRepository.findByGoal(goal).stream()
                .sorted(Comparator.comparing(content -> content.getParentContent() == null ? 1 : 0))
                .toList();
        if (!existing.isEmpty()) {
            learningContentRepository.deleteAll(existing);
        }

        if (modules == null || modules.isEmpty()) {
            return;
        }

        for (int moduleIndex = 0; moduleIndex < modules.size(); moduleIndex++) {
            CourseModuleRequest moduleRequest = modules.get(moduleIndex);

            LearningContent module = LearningContent.builder()
                    .goal(goal)
                    .title(moduleRequest.getTitle())
                    .contentType(LearningContent.ContentType.MODULE)
                    .contentText(moduleRequest.getDescription())
                    .durationMinutes(moduleRequest.getDurationMinutes())
                    .difficultyLevel(goal.getDifficultyLevel())
                    .orderIndex(moduleIndex + 1)
                    .metadata(moduleRequest.getMetadata())
                    .build();

            LearningContent savedModule = learningContentRepository.save(module);

            List<CourseContentRequest> contents = moduleRequest.getContents() == null
                    ? List.of()
                    : moduleRequest.getContents();

            for (int contentIndex = 0; contentIndex < contents.size(); contentIndex++) {
                CourseContentRequest contentRequest = contents.get(contentIndex);

                LearningContent content = LearningContent.builder()
                        .goal(goal)
                        .parentContent(savedModule)
                        .title(contentRequest.getTitle())
                        .contentType(contentRequest.getContentType() == null
                                ? LearningContent.ContentType.TEXT
                                : contentRequest.getContentType())
                        .contentUrl(contentRequest.getContentUrl())
                        .contentText(contentRequest.getContentText())
                        .durationMinutes(contentRequest.getDurationMinutes())
                        .difficultyLevel(goal.getDifficultyLevel())
                        .orderIndex(contentIndex + 1)
                        .metadata(contentRequest.getMetadata())
                        .build();

                learningContentRepository.save(content);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<CourseModuleResponse> getCourseStructure(LearningGoal goal) {
        List<LearningContent> topLevelContents = learningContentRepository
                .findByGoalAndParentContentIsNullOrderByOrderIndexAsc(goal);

        List<CourseModuleResponse> modules = new ArrayList<>();
        for (LearningContent content : topLevelContents) {
            if (content.getContentType() == LearningContent.ContentType.MODULE) {
                modules.add(toModuleResponse(content));
                continue;
            }

            CourseContentResponse legacyContent = toContentResponse(content);
            modules.add(CourseModuleResponse.builder()
                    .contentId(content.getContentId())
                    .title(content.getTitle())
                    .description(content.getContentText())
                    .durationMinutes(content.getDurationMinutes())
                    .orderIndex(content.getOrderIndex())
                    .metadata(content.getMetadata())
                    .contents(List.of(legacyContent))
                    .build());
        }

        return modules;
    }

    private CourseModuleResponse toModuleResponse(LearningContent module) {
        List<LearningContent> childContents = learningContentRepository.findByParentContentOrderByOrderIndexAsc(module);

        List<CourseContentResponse> contentResponses = childContents.stream()
                .map(this::toContentResponse)
                .toList();

        return CourseModuleResponse.builder()
                .contentId(module.getContentId())
                .title(module.getTitle())
                .description(module.getContentText())
                .durationMinutes(module.getDurationMinutes())
                .orderIndex(module.getOrderIndex())
                .metadata(module.getMetadata())
                .contents(contentResponses)
                .build();
    }

    private CourseContentResponse toContentResponse(LearningContent content) {
        return CourseContentResponse.builder()
                .contentId(content.getContentId())
                .title(content.getTitle())
                .contentType(content.getContentType())
                .contentUrl(content.getContentUrl())
                .contentText(content.getContentText())
                .durationMinutes(content.getDurationMinutes())
                .orderIndex(content.getOrderIndex())
                .metadata(content.getMetadata())
                .build();
    }
}
