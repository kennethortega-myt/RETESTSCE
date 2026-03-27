package pe.gob.onpe.sceorcbackend.model.postgresql.importar.entity;


import lombok.*;


import jakarta.persistence.*;

import java.io.Serializable;
import java.util.Date;


@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "det_tipo_eleccion_documento_electoral_escrutinio")
public class ImportDetalleTipoEleccionDocumentoElectoralEscrutinio implements Serializable {

	private static final long serialVersionUID = 1364960067098699897L;

	@Id
    @Column(name = "n_det_tipo_eleccion_documento_electoral_escrutinio_pk")
    private Long	id;

    @Column(name="n_eleccion")
    private Integer eleccion;

    @Column(name = "n_distrito_electoral")
    private Integer distritoElectoral;

    @Column(name = "n_documento_electoral")
    private Integer documentoElectoral;

    @Column(name = "n_activo")
    private Integer activo;

    @Column(name = "c_aud_usuario_creacion")
    private String 	usuarioCreacion;

    @Column(name = "d_aud_fecha_creacion")
    private Date fechaCreacion;

    @Column(name = "c_aud_usuario_modificacion")
    private String	usuarioModificacion;

    @Column(name = "d_aud_fecha_modificacion")
    @Setter(AccessLevel.NONE)
    private Date	fechaModificacion;

    @PrePersist
	public void prePersist() {
		this.fechaCreacion = new Date();
	}

	@PreUpdate
	public void preUpdate() {
		this.fechaModificacion = new Date();
	}
}
