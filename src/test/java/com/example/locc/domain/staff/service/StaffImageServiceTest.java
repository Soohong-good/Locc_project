package com.example.locc.domain.staff.service;

import com.example.locc.config.FileProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * StaffImageService 단위 테스트 (순수 로직 + 실제 임시 디렉토리 파일 I/O, DB/Mock 불필요)
 */
@DisplayName("StaffImageService 단위 테스트")
class StaffImageServiceTest {

    @TempDir
    Path tempDir;

    private StaffImageService newService() {
        FileProperties fileProperties = new FileProperties();
        fileProperties.setUploadDir(tempDir.toString());
        return new StaffImageService(fileProperties);
    }

    private byte[] realPngBytes() throws IOException {
        BufferedImage image = new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, "png", out);
        return out.toByteArray();
    }

    @Test
    @DisplayName("업로드 - 빈 파일이면 IllegalArgumentException")
    void upload_emptyFile() {
        MockMultipartFile file = new MockMultipartFile("image", "test.png", "image/png", new byte[0]);

        assertThatThrownBy(() -> newService().upload(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("비어있습니다");
    }

    @Test
    @DisplayName("업로드 - 10MB 초과면 IllegalArgumentException")
    void upload_tooLarge() {
        MockMultipartFile file = new MockMultipartFile("image", "test.png", "image/png", new byte[10 * 1024 * 1024 + 1]);

        assertThatThrownBy(() -> newService().upload(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("10MB");
    }

    @Test
    @DisplayName("업로드 - 이미지가 아닌 MIME 타입이면 IllegalArgumentException")
    void upload_notImageMimeType() {
        MockMultipartFile file = new MockMultipartFile("image", "test.txt", "text/plain", new byte[]{1, 2, 3});

        assertThatThrownBy(() -> newService().upload(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("이미지 파일만");
    }

    @Test
    @DisplayName("업로드 - MIME은 image/*이나 실제 이미지가 아니면(스푸핑) IllegalArgumentException")
    void upload_mimeSpoofed() {
        MockMultipartFile file = new MockMultipartFile("image", "test.png", "image/png", "이미지 아님".getBytes());

        assertThatThrownBy(() -> newService().upload(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("유효한 이미지");
    }

    @Test
    @DisplayName("업로드 - 정상 이미지면 저장되고 웹 접근 경로를 반환한다")
    void upload_success() throws IOException {
        MockMultipartFile file = new MockMultipartFile("image", "photo.png", "image/png", realPngBytes());

        String path = newService().upload(file);

        assertThat(path).startsWith("/uploads/staff/").endsWith(".png");
        Path savedFile = tempDir.resolve("staff").resolve(path.substring("/uploads/staff/".length()));
        assertThat(Files.exists(savedFile)).isTrue();
    }

    @Test
    @DisplayName("업로드 - 원본 파일명에 경로 구분자가 있어도 파일명만 남긴다 (Path Traversal 방지)")
    void upload_stripsPathTraversal() throws IOException {
        MockMultipartFile file = new MockMultipartFile("image", "../../evil.png", "image/png", realPngBytes());

        String path = newService().upload(file);

        assertThat(path).startsWith("/uploads/staff/").doesNotContain("..");
    }

    @Test
    @DisplayName("경로로 삭제 - null이면 아무 일도 일어나지 않는다")
    void deleteByPath_null() {
        assertThatCode(() -> newService().deleteByPath(null)).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("경로로 삭제 - 빈 문자열이면 아무 일도 일어나지 않는다")
    void deleteByPath_blank() {
        assertThatCode(() -> newService().deleteByPath("  ")).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("경로로 삭제 - 존재하는 파일이면 실제로 삭제된다")
    void deleteByPath_existingFile() throws IOException {
        Path file = tempDir.resolve("to-delete.png");
        Files.write(file, realPngBytes());
        assertThat(Files.exists(file)).isTrue();

        newService().deleteByPath(file.toString());

        assertThat(Files.exists(file)).isFalse();
    }

    @Test
    @DisplayName("경로로 삭제 - 존재하지 않는 파일이어도 예외 없이 무시된다")
    void deleteByPath_nonExistentFile() {
        Path nonExistent = tempDir.resolve("no-such-file.png");

        assertThatCode(() -> newService().deleteByPath(nonExistent.toString())).doesNotThrowAnyException();
    }
}
