package pe.gob.onpe.scebackend.model.dto.response;

import lombok.Data;

@Data
public class FileStorageResponseDTO {
    private Integer identificador;
    
    private String token;

    public FileStorageResponseDTO(){
       
    }
    public FileStorageResponseDTO(String token){
        this.token = token;
    }

  
    
}
