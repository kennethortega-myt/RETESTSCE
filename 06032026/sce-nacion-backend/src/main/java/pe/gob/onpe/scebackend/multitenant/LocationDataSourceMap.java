package pe.gob.onpe.scebackend.multitenant;

import java.util.HashMap;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.stereotype.Component;

import pe.gob.onpe.scebackend.model.entities.ConfiguracionProcesoElectoral;
import pe.gob.onpe.scebackend.model.repository.ConfiguracionProcesoElectoralRepository;

@SuppressWarnings("serial")
@Slf4j
@Component
public class LocationDataSourceMap extends HashMap<Object, Object> implements ApplicationContextAware {

	private ApplicationContext applicationContext;

	private final DataSourceConfig dataSourceConfig;

    public LocationDataSourceMap(DataSourceConfig dataSourceConfig) {
        this.dataSourceConfig = dataSourceConfig;
    }

    @Override
	public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
		this.applicationContext = applicationContext;
	}
	
	@Override
    public Object get(Object key) {
        Object value = super.get(key);
        if (value == null) {

        	ConfiguracionProcesoElectoralRepository repo = applicationContext.getBean(ConfiguracionProcesoElectoralRepository.class);
        	ConfiguracionProcesoElectoral tenant = repo.findByProceso((String) key);
            if (tenant != null) {
            	log.info("El usuario tiene registrado el esquema = {}", tenant.getNombreEsquemaPrincipal());
            	DriverManagerDataSource dataSource = new DriverManagerDataSource();
                dataSource.setDriverClassName("org.postgresql.Driver");
                dataSource.setUrl(dataSourceConfig.getUrl());
                dataSource.setUsername(dataSourceConfig.getUsername());
                dataSource.setPassword(dataSourceConfig.getPassword());
                dataSource.setSchema(tenant.getNombreEsquemaPrincipal().toLowerCase());
                value = dataSource;
                super.put(key, value);
            } 
        } else {
        	log.info("El datasource ya se encuentra mapeado producto de una consulta anterior");
        }
        return value;
    }

}
