package pe.gob.onpe.scescanner.controller;

import pe.gob.onpe.scescanner.domain.DocumentoElectoral;
import pe.gob.onpe.scescanner.domain.Login;

public interface IMainController {

    void mostrarLoginTokenInvalido();

    Login getDataLogin();

    void onCerrarSesion();

    boolean refreshToken();

    int onMostrarResolucionEscaneada(String strValRetFromLib, DocumentoElectoral docElectoral, String numeroDocumento, long idDoc);

    void onFinalizoGuardadoDocumento();
}
