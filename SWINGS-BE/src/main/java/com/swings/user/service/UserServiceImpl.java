package com.swings.user.service;

import com.swings.email.service.EmailService;
import com.swings.user.dto.UserDTO;
import com.swings.user.entity.UserEntity;
import com.swings.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public boolean isUsernameExists(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    @Override
    public UserEntity registerUser(UserDTO dto) {
        if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        String encryptedPassword = passwordEncoder.encode(dto.getPassword());

        UserEntity user = UserEntity.builder()
                .username(dto.getUsername())
                .password(encryptedPassword)
                .name(dto.getName())
                .gender(UserEntity.Gender.fromString(dto.getGender()))
                .birthDate(LocalDate.parse(dto.getBirthDate()))
                .email(dto.getEmail())
                .phonenumber(dto.getPhonenumber())
                .job(dto.getJob() != null ? dto.getJob() : "")
                .golfSkill(UserEntity.GolfSkill.fromString(
                        dto.getGolfSkill() != null ? dto.getGolfSkill() : "beginner"
                ))
                .mbti(dto.getMbti() != null ? dto.getMbti() : "")
                .hobbies(dto.getHobbies() != null ? dto.getHobbies() : "")
                .religion(dto.getReligion() != null ? dto.getReligion() : "none")
                .smoking(UserEntity.YesNo.fromString(
                        dto.getSmoking() != null ? dto.getSmoking() : "no"
                ))
                .drinking(UserEntity.YesNo.fromString(
                        dto.getDrinking() != null ? dto.getDrinking() : "no"
                ))
                .introduce(dto.getIntroduce() != null ? dto.getIntroduce() : "")
                .userImg(dto.getUserImg())
                .role(UserEntity.Role.fromString(dto.getRole() != null ? dto.getRole() : "player"))
                .activityRegion(UserEntity.ActivityRegion.fromString(
                        dto.getActivityRegion() != null ? dto.getActivityRegion() : "SEOUL"
                ))
                .isVerified(false)
                .build();

        UserEntity savedUser = userRepository.save(user);
        emailService.sendEmailVerification(savedUser);
        System.out.println("[이메일 인증 메일 전송]: " + user.getEmail());

        return savedUser;
    }

    @Override
    public UserEntity getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자를 찾을 수 없습니다."));
    }

    @Override
    public UserEntity getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetails userDetails) {
            return getUserByUsername(userDetails.getUsername());
        }

        throw new IllegalArgumentException("인증 정보가 유효하지 않습니다.");
    }

    @Override
    public UserDTO getCurrentUserDto() {
        return convertToDto(getCurrentUser());
    }

    @Override
    public UserDTO convertToDto(UserEntity user) {
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setPassword(null);
        dto.setName(user.getName());
        dto.setBirthDate(user.getBirthDate() != null ? user.getBirthDate().toString() : "1900-01-01");
        dto.setPhonenumber(user.getPhonenumber() != null ? user.getPhonenumber() : "000-0000-0000");
        dto.setEmail(user.getEmail() != null ? user.getEmail() : "unknown@email.com");
        dto.setJob(user.getJob() != null ? user.getJob() : "unknown");
        dto.setGolfSkill(user.getGolfSkill() != null ? user.getGolfSkill().name() : "beginner");
        dto.setMbti(user.getMbti() != null ? user.getMbti() : "NONE");
        dto.setHobbies(user.getHobbies() != null ? user.getHobbies() : "");
        dto.setReligion(user.getReligion() != null ? user.getReligion() : "무교");
        dto.setSmoking(user.getSmoking() != null ? user.getSmoking().name() : "no");
        dto.setDrinking(user.getDrinking() != null ? user.getDrinking().name() : "no");
        dto.setIntroduce(user.getIntroduce() != null ? user.getIntroduce() : "");
        dto.setUserImg(user.getUserImg());
        dto.setRole(user.getRole() != null ? user.getRole().name() : "player");
        dto.setGender(user.getGender() != null ? user.getGender().name() : "male");
        dto.setActivityRegion(user.getActivityRegion() != null ? user.getActivityRegion().name() : "SEOUL");
        dto.setIsVerified(user.isVerified());
        return dto;
    }

    @Override
    public UserEntity updateUser(String username, UserDTO dto) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (dto.getUsername() != null && !dto.getUsername().equals(user.getUsername())) {
            userRepository.findByUsername(dto.getUsername())
                    .ifPresent(u -> {
                        throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
                    });
            user.setUsername(dto.getUsername());
        }

        if (dto.getName() != null) {
            user.setName(dto.getName());
        }
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
                user.setPassword(passwordEncoder.encode(dto.getPassword()));
            }
        }
        if (dto.getBirthDate() != null) {
            user.setBirthDate(LocalDate.parse(dto.getBirthDate()));
        }
        if (dto.getEmail() != null) {
            user.setEmail(dto.getEmail());
        }
        if (dto.getPhonenumber() != null) {
            user.setPhonenumber(dto.getPhonenumber());
        }
        if (dto.getJob() != null) {
            user.setJob(dto.getJob());
        }
        if (dto.getGolfSkill() != null) {
            user.setGolfSkill(UserEntity.GolfSkill.fromString(dto.getGolfSkill()));
        }
        if (dto.getMbti() != null) {
            user.setMbti(dto.getMbti());
        }
        if (dto.getHobbies() != null) {
            user.setHobbies(dto.getHobbies());
        }
        if (dto.getReligion() != null) {
            user.setReligion(dto.getReligion());
        }
        if (dto.getSmoking() != null) {
            user.setSmoking(UserEntity.YesNo.fromString(dto.getSmoking()));
        }
        if (dto.getDrinking() != null) {
            user.setDrinking(UserEntity.YesNo.fromString(dto.getDrinking()));
        }
        if (dto.getIntroduce() != null) {
            user.setIntroduce(dto.getIntroduce());
        }
        if (dto.getUserImg() != null) {
            user.setUserImg(dto.getUserImg());
        }
        if (dto.getRole() != null) {
            user.setRole(UserEntity.Role.fromString(dto.getRole()));
        }
        if (dto.getGender() != null) {
            user.setGender(UserEntity.Gender.fromString(dto.getGender()));
        }
        if (dto.getActivityRegion() != null) {
            user.setActivityRegion(UserEntity.ActivityRegion.fromString(dto.getActivityRegion()));
        }
        if (dto.getIsVerified() != null) {
            user.setVerified(dto.getIsVerified());
        }

        return userRepository.save(user);
    }

    @Override
    public void updateProfileImage(MultipartFile image) {
        UserEntity user = getCurrentUser();

        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("이미지가 비어 있습니다.");
        }

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            File uploadDirectory = uploadPath.toFile();
            if (!uploadDirectory.exists() && !uploadDirectory.mkdirs()) {
                throw new IOException("업로드 디렉토리를 생성할 수 없습니다: " + uploadPath);
            }

            String originalFilename = image.getOriginalFilename();
            String savedFilename = UUID.randomUUID() + "_" + originalFilename;
            File dest = uploadPath.resolve(savedFilename).toFile();

            if (user.getUserImg() != null && !user.getUserImg().isEmpty()) {
                File oldImage = uploadPath.resolve(user.getUserImg()).toFile();
                if (oldImage.exists()) {
                    oldImage.delete();
                }
            }

            image.transferTo(dest);
            user.setUserImg(savedFilename);
            userRepository.save(user);
        } catch (IOException e) {
            throw new RuntimeException("이미지 저장 실패: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteCurrentUserWithPassword(String password) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetails userDetails) {
            String username = userDetails.getUsername();
            UserEntity user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

            if (!passwordEncoder.matches(password, user.getPassword())) {
                throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
            }

            userRepository.delete(user);
            return;
        }

        throw new IllegalArgumentException("인증 정보가 유효하지 않습니다.");
    }

    @Override
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public List<UserDTO> getAllUsersDto() {
        return userRepository.findAll().stream()
                .map(user -> {
                    try {
                        return convertToDto(user);
                    } catch (Exception e) {
                        System.out.println("DTO 변환 실패: userId=" + user.getUserId() + ", " + e.getMessage());
                        return null;
                    }
                })
                .filter(dto -> dto != null)
                .toList();
    }

    @Override
    public void deleteUserByUsername(String username) {
        UserEntity user = getUserByUsername(username);
        userRepository.delete(user);
    }

    @Override
    public void updateUserRole(String username, String newRole) {
        UserEntity user = getUserByUsername(username);
        user.setRole(UserEntity.Role.fromString(newRole));
        userRepository.save(user);
    }

    @Override
    public void resetPassword(String username, String email) {
        UserEntity user = userRepository.findByUsernameAndEmail(username, email)
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 이메일이 일치하지 않습니다."));

        String tempPassword = UUID.randomUUID().toString().substring(0, 8);
        user.setPassword(passwordEncoder.encode(tempPassword));
        userRepository.save(user);
        emailService.sendTemporaryPassword(user, tempPassword);
    }

    @Override
    public void updatePushToken(String username, String token) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + username));
        user.setPushToken(token);
        userRepository.save(user);
    }
}
