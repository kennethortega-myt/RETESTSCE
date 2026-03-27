package pe.gob.onpe.sceorcbackend.model.dto.response;


import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class DigitizationGetFilesResponse implements Serializable {

	private static final long serialVersionUID = 8573174203328059993L;
	
	private String acta1File;
    private String acta2File;
    public DigitizationGetFilesResponse() {
    }

    public DigitizationGetFilesResponse(String acta1File, String acta2File) {
        this.acta1File = acta1File;
        this.acta2File = acta2File;
    }
}
