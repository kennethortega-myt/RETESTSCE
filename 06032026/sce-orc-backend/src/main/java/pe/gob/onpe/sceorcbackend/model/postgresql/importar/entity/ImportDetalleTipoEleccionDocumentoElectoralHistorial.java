package pe.gob.onpe.sceorcbackend.model.postgresql.importar.entity;



import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;


import jakarta.persistence.*;

import java.io.Serializable;
import java.util.Date;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
@Entity
@Table(name = "det_tipo_eleccion_documento_electoral")
public class ImportDetalleTipoEleccionDocumentoElectoralHistorial implements Serializable {

	private static final long serialVersionUID = 1381376980905754420L;

	@Id
    @Column(name = "n_det_tipo_eleccion_documento_electoral_pk")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "n_proceso_electoral", referencedColumnName="n_proceso_electoral_pk")
    private ImportProcesoElectoral procesoElectoral;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "n_eleccion", referencedColumnName="n_eleccion_pk")
    private ImportEleccion eleccion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "n_documento_electoral", referencedColumnName="n_documento_electoral_pk")
    private ImportDocumentoElectoral documentoElectoral;
    
    @Column(name = "c_rango_inicial")
    private String rangoInicial;
    
    @Column(name = "c_rango_final")
    private String rangoFinal;
    
    @Column(name = "c_digito_chequeo")
    private String digitoChequeo;
    
    @Column(name = "c_digito_error")
    private String digitoError;
    
    @Column(name = "n_correlativo")
    private Integer correlativo;

    @Column(name = "n_requerido")
    private Integer requerido;

    @Column(name = "n_activo")
    private Integer activo;

    @Column(name = "c_aud_usuario_creacion")
    private String usuarioCreacion;

    @Column(name = "d_aud_fecha_creacion")
    private Date fechaCreacion;

    @Column(name = "c_aud_usuario_modificacion")
    private String usuarioModificacion;

    @Column(name = "d_aud_fecha_modificacion")
    @Setter(AccessLevel.NONE)
    private Date fechaModificacion;

    @PrePersist
	public void prePersist() {
		this.fechaCreacion = new Date();
	}

	@PreUpdate
	public void preUpdate() {
		this.fechaModificacion = new Date();
	}
    
    
}
