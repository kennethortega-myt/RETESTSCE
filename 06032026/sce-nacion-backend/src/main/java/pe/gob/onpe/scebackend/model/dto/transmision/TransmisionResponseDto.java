package pe.gob.onpe.scebackend.model.dto.transmision;

import java.io.Serializable;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class TransmisionResponseDto implements Serializable {

	private static final long serialVersionUID = -1934867961916561312L;
	
	private boolean success;
    private String message;
    private List<ActaTransmitidaDto> actasTransmitidas;
    
    public static TransmisionResponseDto getObject(String jsonString) throws JsonProcessingException {
		ObjectMapper objectMapper = new ObjectMapper();
		return objectMapper.readValue(jsonString, TransmisionResponseDto.class);
	}
	
	public String toJson() throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.writeValueAsString(this);
	}

}
