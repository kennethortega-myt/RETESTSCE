package pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.reportes;

import java.util.List;

import pe.gob.onpe.sceorcbackend.model.dto.reporte.ComparacionDigitacionAutomaticaDto;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.FiltroComparacionDigitacionAutomaticaDto;

public interface IComparacionDigitacionAutomaticaRepository {
    List<ComparacionDigitacionAutomaticaDto> listaComparacionDigitacionAutomatica(FiltroComparacionDigitacionAutomaticaDto filtro);
    List<ComparacionDigitacionAutomaticaDto> listaComparacionDigitacionAutomaticaPref(FiltroComparacionDigitacionAutomaticaDto filtro);
}
