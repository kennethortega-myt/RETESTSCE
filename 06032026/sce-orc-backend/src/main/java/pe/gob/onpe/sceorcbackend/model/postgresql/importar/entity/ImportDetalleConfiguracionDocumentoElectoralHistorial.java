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
import java.math.BigDecimal;
import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
@Entity
@Table(name = "det_configuracion_documento_electoral")
public class ImportDetalleConfiguracionDocumentoElectoralHistorial implements Serializable {

	private static final long serialVersionUID = 7652397110667407864L;

	@Id
    @Column(name = "n_det_configuracion_documento_electoral_pk")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "n_det_tipo_eleccion_documento_electoral", referencedColumnName = "n_det_tipo_eleccion_documento_electoral_pk")
    private ImportDetalleTipoEleccionDocumentoElectoralHistorial detalleTipoEleccionDocumentoElectoralHistorial;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "n_seccion")
    private ImportSeccion seccion;
    
    @Column(name = "n_correlativo")
    private Integer correlativo;

    @Column(name = "n_tipo_dato")
    private Integer tipoDato;

    @Column(name = "n_habilitado")
    private Integer habilitado;

    @Column(name = "c_pixel_superior_x")
    private BigDecimal pixelTopX;

    @Column(name = "c_pixel_superior_y")
    private BigDecimal pixelTopY;

    @Column(name = "c_pixel_inferior_x")
    private BigDecimal pixelBottomX;

    @Column(name = "c_pixel_inferior_y")
    private BigDecimal pixelBottomY;
    
    @Column(name = "c_coordenada_relativa_superior_x")
    private BigDecimal coordenadaRelativaTopX;

    @Column(name = "c_coordenada_relativa_superior_y")
    private BigDecimal coordenadaRelativaTopY;

    @Column(name = "c_coordenada_relativa_inferior_x")
    private BigDecimal coordenadaRelativaBottomX;

    @Column(name = "c_coordenada_relativa_inferior_y")
    private BigDecimal coordenadaRelativaBottomY;

    @Column(name = "c_ancho")
    private BigDecimal width;

    @Column(name = "c_altura")
    private BigDecimal height;
    
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
