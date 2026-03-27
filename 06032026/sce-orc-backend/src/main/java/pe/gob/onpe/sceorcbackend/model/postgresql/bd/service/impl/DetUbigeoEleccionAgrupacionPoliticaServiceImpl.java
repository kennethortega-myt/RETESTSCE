package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.impl;

import org.springframework.stereotype.Service;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.DetUbigeoEleccionAgrupacionPolitica;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.UbigeoEleccion;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.DetUbigeoEleccionAgrupacionPoliticaRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.DetUbigeoEleccionAgrupacionPoliticaService;

import java.util.List;
import java.util.Optional;

@Service
public class DetUbigeoEleccionAgrupacionPoliticaServiceImpl implements DetUbigeoEleccionAgrupacionPoliticaService {

    private DetUbigeoEleccionAgrupacionPoliticaRepository detUbigeoEleccionAgrupacionPoliticaRepository;

    private DetUbigeoEleccionAgrupacionPoliticaServiceImpl(DetUbigeoEleccionAgrupacionPoliticaRepository detUbigeoEleccionAgrupacionPoliticaRepository){
        this.detUbigeoEleccionAgrupacionPoliticaRepository = detUbigeoEleccionAgrupacionPoliticaRepository;
    }

    @Override
    public void save(DetUbigeoEleccionAgrupacionPolitica detUbigeoEleccionAgrupacionPolitica) {
        this.detUbigeoEleccionAgrupacionPoliticaRepository.save(detUbigeoEleccionAgrupacionPolitica);
    }

    @Override
    public void saveAll(List<DetUbigeoEleccionAgrupacionPolitica> k) {
        this.detUbigeoEleccionAgrupacionPoliticaRepository.saveAll(k);
    }

    @Override
    public void deleteAll() {
        this.detUbigeoEleccionAgrupacionPoliticaRepository.deleteAll();
    }

    @Override
    public List<DetUbigeoEleccionAgrupacionPolitica> findAll() {
        return this.detUbigeoEleccionAgrupacionPoliticaRepository.findAll();
    }



    @Override
    public List<DetUbigeoEleccionAgrupacionPolitica> findByUbigeoEleccion(UbigeoEleccion ubigeoEleccion) {
        return this.detUbigeoEleccionAgrupacionPoliticaRepository.findByUbigeoEleccion(ubigeoEleccion);
    }

    @Override
    public Optional<DetUbigeoEleccionAgrupacionPolitica> findByPosicionAndIdUbigeoEleccion(Integer posicion, Long idUbigeoEleccion) {
        return this.detUbigeoEleccionAgrupacionPoliticaRepository.findByPosicionAndUbigeoEleccionId(posicion, idUbigeoEleccion);
    }
}
