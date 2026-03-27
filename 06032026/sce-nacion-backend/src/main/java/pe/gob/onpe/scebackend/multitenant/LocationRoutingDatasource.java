package pe.gob.onpe.scebackend.multitenant;

import java.util.Map;

import javax.sql.DataSource;

import java.sql.Connection;
import java.sql.SQLException;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.datasource.AbstractDataSource;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

@Slf4j
public class LocationRoutingDatasource extends AbstractDataSource {
	

	private Map<Object, Object> targetDataSources;
	
	@Autowired
	private DataSourceConfig dataSourceConfig;

    public void setTargetDataSources(Map<Object, Object> targetDataSources) {
        this.targetDataSources = targetDataSources;
    }

    public Connection getConnection() throws SQLException {
        return determineTargetDataSource().getConnection();
    }

    public Connection getConnection(String username, String password) throws SQLException {
        return determineTargetDataSource().getConnection(username, password);
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> T unwrap(Class<T> iface) throws SQLException {
        if (iface.isInstance(this)) {
            return (T) this;
        }
        return determineTargetDataSource().unwrap(iface);
    }

    @Override
    public boolean isWrapperFor(Class<?> iface) throws SQLException {
        return (iface.isInstance(this) || determineTargetDataSource().isWrapperFor(iface));
    }

    protected DataSource determineTargetDataSource() {
        Object lookupKey = CurrentTenantId.get();
        log.info("lookupKey= {} ", (lookupKey!=null?lookupKey.toString(): "no key"));
        DriverManagerDataSource   dataSource = (DriverManagerDataSource) this.targetDataSources.get(lookupKey);
        if (dataSource == null) {
        	log.info("Se determino el datasource por defecto");
        	DriverManagerDataSource defaultDataSource = new DriverManagerDataSource();
        	defaultDataSource.setDriverClassName("org.postgresql.Driver");
        	defaultDataSource.setUrl(dataSourceConfig.getUrl());
        	defaultDataSource.setUsername(dataSourceConfig.getUsername());
        	defaultDataSource.setPassword(dataSourceConfig.getPassword());
        	defaultDataSource.setSchema(dataSourceConfig.getSchemaOrcDefault().toLowerCase());
            return defaultDataSource;
        } else {
        	log.info("se conectara a la url: {}", dataSource.getUrl());
        	log.info("Se retorno el datasource configurado: {}", dataSource.getSchema());
        }
        return dataSource;
    }
	
}
