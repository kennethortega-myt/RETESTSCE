


drop sequence sce_nacion_cc_2.seq_admin_cab_catalogo_pk;
drop sequence sce_nacion_cc_2.seq_admin_det_catalogo_estructura_pk;
drop sequence sce_nacion_cc_2.seq_admin_det_catalogo_referencia_pk;
drop sequence sce_nacion_cc_2.seq_admin_det_configuracion_documento_electoral_historial_pk;
drop sequence sce_nacion_cc_2.seq_admin_det_tipo_eleccion_documento_electoral_historial_pk;
drop sequence sce_nacion_cc_2.seq_admin_tab_archivo_pk;
drop sequence sce_nacion_cc_2.seq_admin_tab_configuracion_proceso_electoral_pk;
drop sequence sce_nacion_cc_2.seq_admin_tab_documento_electoral_pk;
drop sequence sce_nacion_cc_2.seq_admin_tab_seccion_pk;
drop sequence sce_nacion_cc_2.seq_cab_acta_historial_pk;
drop sequence sce_nacion_cc_2.seq_cab_catalogo_pk;
drop sequence sce_nacion_cc_2.seq_cab_parametro_pk;
drop sequence sce_nacion_cc_2.seq_det_acta_accion_pk;
drop sequence sce_nacion_cc_2.seq_det_acta_formato_pk;
drop sequence sce_nacion_cc_2.seq_det_acta_historial_pk;
drop sequence sce_nacion_cc_2.seq_det_acta_opcion_historial_pk;
drop sequence sce_nacion_cc_2.seq_det_acta_opcion_pk;
drop sequence sce_nacion_cc_2.seq_det_acta_pk;
drop sequence sce_nacion_cc_2.seq_det_acta_preferencial_historial_pk;
drop sequence sce_nacion_cc_2.seq_det_acta_preferencial_pk;
drop sequence sce_nacion_cc_2.seq_det_acta_rectangulo_pk;
drop sequence sce_nacion_cc_2.seq_det_acta_resolucion_pk;
drop sequence sce_nacion_cc_2.seq_det_catalogo_estructura_pk;
drop sequence sce_nacion_cc_2.seq_det_catalogo_referencia_pk;
drop sequence sce_nacion_cc_2.seq_det_le_rectangulo_pk;
drop sequence sce_nacion_cc_2.seq_det_mesa_documento_electoral_archivo_pk;
drop sequence sce_nacion_cc_2.seq_det_mm_rectangulo_pk;
drop sequence sce_nacion_cc_2.seq_det_parametro_pk;
drop sequence sce_nacion_cc_2.seq_det_tipo_eleccion_documento_electoral_escrutinio_pk;
drop sequence sce_nacion_cc_2.seq_mae_pr_estructura_participacion_ciudadana_pk;
drop sequence sce_nacion_cc_2.seq_mae_pr_estructura_vistas_pk;
drop sequence sce_nacion_cc_2.seq_tab_archivo_pk;
drop sequence sce_nacion_cc_2.seq_tab_autorizacion_pk;
drop sequence sce_nacion_cc_2.seq_tab_confirm_pc_cc_pk;
drop sequence sce_nacion_cc_2.seq_tab_formato_pk;
drop sequence sce_nacion_cc_2.seq_tab_inicializacion_centro_computo_pk;
drop sequence sce_nacion_cc_2.seq_tab_mesa_documento_pk;
drop sequence sce_nacion_cc_2.seq_tab_miembro_mesa_cola_pk;
drop sequence sce_nacion_cc_2.seq_tab_omiso_miembro_mesa_pk;
drop sequence sce_nacion_cc_2.seq_tab_omiso_votante_pk;
drop sequence sce_nacion_cc_2.seq_tab_pr_transmision_pk;
drop sequence sce_nacion_cc_2.seq_tab_puesta_cero_pk;
drop sequence sce_nacion_cc_2.seq_tab_resolucion_pk;
drop sequence sce_nacion_cc_2.seq_tab_transmision_envio_pk;
drop sequence sce_nacion_cc_2.seq_tab_transmision_recepcion_pk;
drop sequence sce_nacion_cc_2.seq_tab_usuario_pk;
drop sequence sce_nacion_cc_2.seq_tab_usuario_temporal_pk;
drop sequence sce_nacion_cc_2.seq_tab_version_cc_pk;
drop sequence sce_nacion_cc_2.seq_tab_version_pk;
drop sequence sce_nacion_cc_2.tab_acta_transmision_n_transmision_pk_seq;
drop sequence sce_nacion_cc_2.tab_padron_electoral_progreso_n_padron_electoral_progreso_p_seq;

-- settear to default
alter table sce_nacion_cc_2.cab_acta alter column n_acta_pk drop default;
alter table sce_nacion_cc_2.cab_acta_historial alter column n_acta_historial_pk drop default;
alter table sce_nacion_cc_2.cab_catalogo alter column n_catalogo_pk drop default;
alter table sce_nacion_cc_2.cab_parametro alter column n_parametro_pk drop default;
alter table sce_nacion_cc_2.det_acta alter column n_det_acta_pk drop default;
alter table sce_nacion_cc_2.det_acta_accion alter column n_det_acta_accion_pk drop default;
alter table sce_nacion_cc_2.det_acta_formato alter column n_det_acta_formato_pk drop default;
alter table sce_nacion_cc_2.det_acta_historial alter column n_det_acta_historial_pk drop default;
alter table sce_nacion_cc_2.det_acta_opcion alter column n_det_acta_opcion_pk drop default;
alter table sce_nacion_cc_2.det_acta_opcion_historial alter column n_det_acta_opcion_historial_pk drop default;
alter table sce_nacion_cc_2.det_acta_preferencial alter column n_det_acta_preferencial_pk drop default;
alter table sce_nacion_cc_2.det_acta_preferencial_historial alter column n_det_acta_preferencial_historial_pk drop default;
alter table sce_nacion_cc_2.det_acta_rectangulo alter column n_det_acta_rectangulo_pk drop default;
alter table sce_nacion_cc_2.det_acta_resolucion alter column n_det_acta_resolucion_pk drop default;
alter table sce_nacion_cc_2.det_catalogo_estructura alter column n_det_catalogo_estructura_pk drop default;
alter table sce_nacion_cc_2.det_catalogo_referencia alter column n_det_catalogo_referencia_pk drop default;
alter table sce_nacion_cc_2.det_configuracion_documento_electoral alter column n_det_configuracion_documento_electoral_pk drop default;
alter table sce_nacion_cc_2.det_le_rectangulo alter column n_det_le_rectangulo_pk drop default;
alter table sce_nacion_cc_2.det_mesa_documento_electoral_archivo alter column n_det_mesa_documento_electoral_archivo_pk drop default;
alter table sce_nacion_cc_2.det_mm_rectangulo alter column n_det_le_rectangulo_pk drop default;
alter table sce_nacion_cc_2.det_parametro alter column n_det_parametro_pk drop default;
alter table sce_nacion_cc_2.det_tipo_eleccion_documento_electoral alter column n_det_tipo_eleccion_documento_electoral_pk drop default;
alter table sce_nacion_cc_2.det_tipo_eleccion_documento_electoral_escrutinio alter column n_det_tipo_eleccion_documento_electoral_escrutinio_pk drop default;
alter table sce_nacion_cc_2.det_ubigeo_eleccion alter column n_det_ubigeo_eleccion_pk drop default;
alter table sce_nacion_cc_2.det_ubigeo_eleccion_agrupacion_politica alter column n_det_ubigeo_eleccion_agrupacion_politica_pk drop default;
alter table sce_nacion_cc_2.mae_agrupacion_politica alter column n_agrupacion_politica_pk drop default;
alter table sce_nacion_cc_2.mae_ambito_electoral alter column n_ambito_electoral_pk drop default;
alter table sce_nacion_cc_2.mae_candidato alter column n_candidato_pk drop default;
alter table sce_nacion_cc_2.mae_centro_computo alter column n_centro_computo_pk drop default;
alter table sce_nacion_cc_2.mae_distrito_electoral alter column n_distrito_electoral_pk drop default;
alter table sce_nacion_cc_2.mae_eleccion alter column n_eleccion_pk drop default;
alter table sce_nacion_cc_2.mae_local_votacion alter column n_local_votacion_pk drop default;
alter table sce_nacion_cc_2.mae_opcion_voto alter column n_opcion_voto_pk drop default;
alter table sce_nacion_cc_2.mae_pr_estructura_participacion_ciudadana alter column n_id_fila_pk drop default;
alter table sce_nacion_cc_2.mae_pr_estructura_vistas alter column n_id_fila_pk drop default;
alter table sce_nacion_cc_2.mae_proceso_electoral alter column n_proceso_electoral_pk drop default;
alter table sce_nacion_cc_2.mae_region alter column n_region_pk drop default;
alter table sce_nacion_cc_2.mae_ubigeo alter column n_ubigeo_pk drop default;
alter table sce_nacion_cc_2.tab_acta_transmision alter column n_transmision_pk drop default;
alter table sce_nacion_cc_2.tab_archivo alter column n_archivo_pk drop default;
alter table sce_nacion_cc_2.tab_autorizacion alter column n_tab_autorizacion_pk drop default;
alter table sce_nacion_cc_2.tab_confirm_pc_cc alter column n_tab_confirm_pc_cc_pk drop default;
alter table sce_nacion_cc_2.tab_documento_electoral alter column n_documento_electoral_pk drop default;
alter table sce_nacion_cc_2.tab_formato alter column n_formato_pk drop default;
alter table sce_nacion_cc_2.tab_inicializacion_centro_computo alter column n_inicializacion_centro_computo_pk drop default;
alter table sce_nacion_cc_2.tab_mesa alter column n_mesa_pk drop default;
alter table sce_nacion_cc_2.tab_miembro_mesa_cola alter column n_miembro_mesa_cola_pk drop default;
alter table sce_nacion_cc_2.tab_miembro_mesa_sorteado alter column n_miembro_mesa_sorteado_pk drop default;
alter table sce_nacion_cc_2.tab_omiso_miembro_mesa alter column n_omiso_miembro_mesa_pk drop default;
alter table sce_nacion_cc_2.tab_omiso_votante alter column n_omiso_votante_pk drop default;
alter table sce_nacion_cc_2.tab_padron_electoral alter column n_padron_electoral_pk drop default;
alter table sce_nacion_cc_2.tab_padron_electoral_progreso alter column n_padron_electoral_progreso_pk drop default;
alter table sce_nacion_cc_2.tab_pr_transmision alter column n_pr_transmision_pk drop default;
alter table sce_nacion_cc_2.tab_puesta_cero alter column n_puesta_cero_pk drop default;
alter table sce_nacion_cc_2.tab_resolucion alter column n_resolucion_pk drop default;
--alter table sce_nacion_cc_2.tab_resumen_eleccion_ubigeo_agrupacion_politica_candidato;
--alter table sce_nacion_cc_2.tab_log;
alter table sce_nacion_cc_2.tab_seccion alter column n_seccion_pk drop default;
alter table sce_nacion_cc_2.tab_transmision_envio alter column n_transmision_envio_pk drop default;
alter table sce_nacion_cc_2.tab_transmision_recepcion alter column n_transmision_recepcion_pk drop default;
alter table sce_nacion_cc_2.tab_usuario alter column n_usuario_pk drop default;
alter table sce_nacion_cc_2.tab_usuario_temporal alter column n_usuario_temporal_pk drop default;
alter table sce_nacion_cc_2.tab_version alter column n_version_pk drop default;
alter table sce_nacion_cc_2.tab_version_cc alter column n_version_cc_pk drop default;

-- add identity
alter table sce_nacion_cc_2.cab_acta alter column n_acta_pk add generated by default as identity;
alter table sce_nacion_cc_2.cab_acta_historial alter column n_acta_historial_pk add generated by default as identity;
alter table sce_nacion_cc_2.cab_catalogo alter column n_catalogo_pk add generated by default as identity;
alter table sce_nacion_cc_2.cab_parametro alter column n_parametro_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_acta alter column n_det_acta_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_acta_accion alter column n_det_acta_accion_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_acta_formato alter column n_det_acta_formato_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_acta_historial alter column n_det_acta_historial_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_acta_opcion alter column n_det_acta_opcion_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_acta_opcion_historial alter column n_det_acta_opcion_historial_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_acta_preferencial alter column n_det_acta_preferencial_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_acta_preferencial_historial alter column n_det_acta_preferencial_historial_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_acta_rectangulo alter column n_det_acta_rectangulo_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_acta_resolucion alter column n_det_acta_resolucion_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_catalogo_estructura alter column n_det_catalogo_estructura_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_catalogo_referencia alter column n_det_catalogo_referencia_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_configuracion_documento_electoral alter column n_det_configuracion_documento_electoral_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_le_rectangulo alter column n_det_le_rectangulo_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_mesa_documento_electoral_archivo alter column n_det_mesa_documento_electoral_archivo_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_mm_rectangulo alter column n_det_le_rectangulo_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_parametro alter column n_det_parametro_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_tipo_eleccion_documento_electoral alter column n_det_tipo_eleccion_documento_electoral_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_tipo_eleccion_documento_electoral_escrutinio alter column n_det_tipo_eleccion_documento_electoral_escrutinio_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_ubigeo_eleccion alter column n_det_ubigeo_eleccion_pk add generated by default as identity;
alter table sce_nacion_cc_2.det_ubigeo_eleccion_agrupacion_politica alter column n_det_ubigeo_eleccion_agrupacion_politica_pk add generated by default as identity;
alter table sce_nacion_cc_2.mae_agrupacion_politica alter column n_agrupacion_politica_pk add generated by default as identity;
alter table sce_nacion_cc_2.mae_ambito_electoral alter column n_ambito_electoral_pk add generated by default as identity;
alter table sce_nacion_cc_2.mae_candidato alter column n_candidato_pk add generated by default as identity;
alter table sce_nacion_cc_2.mae_centro_computo alter column n_centro_computo_pk add generated by default as identity;
alter table sce_nacion_cc_2.mae_distrito_electoral alter column n_distrito_electoral_pk add generated by default as identity;
alter table sce_nacion_cc_2.mae_eleccion alter column n_eleccion_pk add generated by default as identity;
alter table sce_nacion_cc_2.mae_local_votacion alter column n_local_votacion_pk add generated by default as identity;
alter table sce_nacion_cc_2.mae_opcion_voto alter column n_opcion_voto_pk add generated by default as identity;
alter table sce_nacion_cc_2.mae_pr_estructura_participacion_ciudadana alter column n_id_fila_pk add generated by default as identity;
alter table sce_nacion_cc_2.mae_pr_estructura_vistas alter column n_id_fila_pk add generated by default as identity;
alter table sce_nacion_cc_2.mae_proceso_electoral alter column n_proceso_electoral_pk add generated by default as identity;
alter table sce_nacion_cc_2.mae_region alter column n_region_pk add generated by default as identity;
alter table sce_nacion_cc_2.mae_ubigeo alter column n_ubigeo_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_acta_transmision alter column n_transmision_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_archivo alter column n_archivo_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_autorizacion alter column n_tab_autorizacion_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_confirm_pc_cc alter column n_tab_confirm_pc_cc_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_documento_electoral alter column n_documento_electoral_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_formato alter column n_formato_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_inicializacion_centro_computo alter column n_inicializacion_centro_computo_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_mesa alter column n_mesa_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_miembro_mesa_cola alter column n_miembro_mesa_cola_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_miembro_mesa_sorteado alter column n_miembro_mesa_sorteado_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_omiso_miembro_mesa alter column n_omiso_miembro_mesa_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_omiso_votante alter column n_omiso_votante_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_padron_electoral alter column n_padron_electoral_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_padron_electoral_progreso alter column n_padron_electoral_progreso_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_pr_transmision alter column n_pr_transmision_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_puesta_cero alter column n_puesta_cero_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_resolucion alter column n_resolucion_pk add generated by default as identity;
--alter table sce_nacion_cc_2.tab_resumen_eleccion_ubigeo_agrupacion_politica_candidato;
--alter table sce_nacion_cc_2.tab_log;
alter table sce_nacion_cc_2.tab_seccion alter column n_seccion_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_transmision_envio alter column n_transmision_envio_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_transmision_recepcion alter column n_transmision_recepcion_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_usuario alter column n_usuario_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_usuario_temporal alter column n_usuario_temporal_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_version alter column n_version_pk add generated by default as identity;
alter table sce_nacion_cc_2.tab_version_cc alter column n_version_cc_pk add generated by default as identity;


ALTER TABLE sce_cc_eg2026.tab_acta_transmision
ADD COLUMN c_mensaje_error VARCHAR(500);

ALTER TABLE sce_cc_eg2026.tab_acta_transmision
ADD COLUMN n_orden INTEGER;


COMMENT ON COLUMN sce_cc_eg2026.tab_acta_transmision.n_orden IS 'Numero de orden secuencial por acta';
COMMENT ON COLUMN sce_cc_eg2026.tab_acta_transmision.n_orden IS 'Mensaje de error de la transmision';



CREATE TABLE sce_nacion_eg2026.mae_acta_transmision_control (
	n_acta_transmision_control_pk int8 NOT NULL,
	n_acta int4 NOT NULL,
	c_codigo_centro_computo VARCHAR(10) NOT NULL,
	n_orden int2 NOT NULL,
	CONSTRAINT cst_mae_acta_transmision_control_pk PRIMARY KEY (n_acta_transmision_control_pk)
);

CREATE SEQUENCE sce_nacion_eg2026.seq_mae_acta_transmision_control_pk
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 999999999999999
	START 1
	CACHE 1
	NO CYCLE;
	


ALTER TABLE sce_nacion_eg2026.mae_acta_transmision_control
ADD CONSTRAINT uk_mae_acta_transmision_control_pk UNIQUE (n_acta, c_codigo_centro_computo);





