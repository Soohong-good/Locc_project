package com.example.locc.domain.gallery.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * ImageFileValidator 단위 테스트 (순수 로직, DB/Mock 불필요)
 */
@DisplayName("ImageFileValidator 단위 테스트")
class ImageFileValidatorTest {

    private final ImageFileValidator validator = new ImageFileValidator();

    private byte[] realPngBytes() throws IOException {
        BufferedImage image = new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, "png", out);
        return out.toByteArray();
    }

    @Test
    @DisplayName("빈 파일이면 IllegalArgumentException")
    void validate_emptyFile() {
        MockMultipartFile file = new MockMultipartFile("image", "test.png", "image/png", new byte[0]);

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("비어있습니다");
    }

    @Test
    @DisplayName("파일 크기가 10MB를 초과하면 IllegalArgumentException")
    void validate_tooLarge() {
        byte[] oversized = new byte[10 * 1024 * 1024 + 1];
        MockMultipartFile file = new MockMultipartFile("image", "test.png", "image/png", oversized);

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("10MB");
    }

    @Test
    @DisplayName("허용되지 않는 확장자면 IllegalArgumentException")
    void validate_invalidExtension() {
        MockMultipartFile file = new MockMultipartFile("image", "test.exe", "image/png", new byte[]{1, 2, 3});

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("파일 형식");
    }

    @Test
    @DisplayName("허용되지 않는 MIME 타입이면 IllegalArgumentException")
    void validate_invalidMimeType() {
        MockMultipartFile file = new MockMultipartFile("image", "test.png", "application/octet-stream", new byte[]{1, 2, 3});

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("MIME");
    }

    @Test
    @DisplayName("확장자·MIME 타입은 유효하나 실제 이미지가 아니면(스푸핑) IllegalArgumentException")
    void validate_notActuallyAnImage() {
        MockMultipartFile file = new MockMultipartFile("image", "test.png", "image/png", "이건 이미지가 아님".getBytes());

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("정상 이미지 파일이면 예외 없이 통과한다")
    void validate_success() throws IOException {
        MockMultipartFile file = new MockMultipartFile("image", "test.png", "image/png", realPngBytes());

        assertThatCode(() -> validator.validate(file)).doesNotThrowAnyException();
    }
}
