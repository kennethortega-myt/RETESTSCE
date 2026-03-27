package pe.gob.onpe.scebackend.multitenant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource("classpath:application.properties")
public class DataSourceConfig {

	@Value("${spring.datasource.driver-class-name}")
    private String driverClassName;

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;
    
    @Value("${spring.jpa.properties.hibernate.default_schema}")
    private String schemaAdmin;
    
    @Value("${spring.jpa.show-sql}")
    private String showSql;
    
    @Value("${sce.schema.default}")
    private String schemaOrcDefault;

	public String getDriverClassName() {
		return driverClassName;
	}

	public void setDriverClassName(String driverClassName) {
		this.driverClassName = driverClassName;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getSchemaAdmin() {
		return schemaAdmin;
	}

	public void setSchemaAdmin(String schemaAdmin) {
		this.schemaAdmin = schemaAdmin;
	}

	public String getSchemaOrcDefault() {
		return schemaOrcDefault;
	}

	public void setSchemaOrcDefault(String schemaOrcDefault) {
		this.schemaOrcDefault = schemaOrcDefault;
	}

	public String getShowSql() {
		return showSql;
	}

	public void setShowSql(String showSql) {
		this.showSql = showSql;
	}
	
}
