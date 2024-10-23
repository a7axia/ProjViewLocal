package com.projview.projviewbe.service;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.projview.projviewbe.dto.ProjectDto;
import com.projview.projviewbe.repository.ProjectRepository;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@ToString
@Data
@Setter
@EqualsAndHashCode
@Getter
@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;

    @Override
    public Set<ProjectDto> getAllProjects() {
        return projectRepository.findAll().stream().map(project -> {
            return ProjectDto.builder()
                    .id(project.getId())
                    .name(project.getName())
                    .description(project.getDescription())
                    .build();
        }).collect(Collectors.toSet());
    }
}
