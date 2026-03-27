package pe.gob.onpe.scebackend.security.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import pe.gob.onpe.scebackend.exeption.InternalServerErrorException;
import javax.crypto.Cipher;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Base64;

@Service
public class RSAEncryptionService {

    private static final Logger logger = LoggerFactory.getLogger(RSAEncryptionService.class);
    private static final int KEY_SIZE = 2048;
    private KeyPair keyPair;

    @PostConstruct
    public void init() {
        generateKeyPair();
    }

    private void generateKeyPair() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(KEY_SIZE);
            this.keyPair = keyPairGenerator.generateKeyPair();
            logger.info("RSA Key Pair generado exitosamente");
        } catch (Exception e) {
            throw new InternalServerErrorException("Error generando claves RSA");
        }
    }

    public String getPublicKeyAsString() {
        try {
            PublicKey publicKey = keyPair.getPublic();
            byte[] publicKeyBytes = publicKey.getEncoded();
            String publicKeyString = Base64.getEncoder().encodeToString(publicKeyBytes);

            // Formatear como PEM
            return "-----BEGIN PUBLIC KEY-----\n" +
                    publicKeyString.replaceAll("(.{64})", "$1\n") +
                    "\n-----END PUBLIC KEY-----";
        } catch (Exception e) {
            throw new InternalServerErrorException("Error obteniendo clave pública");
        }
    }

    public String decryptPassword(String encryptedPassword) {
        try {
            PrivateKey privateKey = keyPair.getPrivate();

            Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
            cipher.init(Cipher.DECRYPT_MODE, privateKey);

            byte[] encryptedBytes = Base64.getDecoder().decode(encryptedPassword);
            byte[] decryptedBytes = cipher.doFinal(encryptedBytes);

            return new String(decryptedBytes, StandardCharsets.UTF_8);

        } catch (Exception e) {
            throw new InternalServerErrorException("Error desencriptando contraseña");
        }
    }
}
