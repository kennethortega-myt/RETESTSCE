package pe.gob.onpe.scescanner;

/**
 * Gestor de inactividad para la aplicación.
 * Utiliza el patrón Singleton porque debe haber una única instancia global
 * que gestione el estado de inactividad de toda la aplicación JavaFX.
 * 
 * @author ncoqchi
 */
import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.application.Platform;
import javafx.util.Duration;

@SuppressWarnings("java:S6548") // Singleton es apropiado aquí: gestiona estado global de inactividad
public class IdleManager {

    private Timeline idleTimer;
    private Runnable onTimeout;

    private IdleManager() {
        // Constructor privado para prevenir instanciación externa
    }

    /**
     * Holder estático para inicialización lazy thread-safe.
     * La clase interna solo se carga cuando se llama a getInstance().
     */
    private static class SingletonHolder {
        private static final IdleManager INSTANCE = new IdleManager();
    }

    /**
     * Obtiene la instancia única de IdleManager.
     * Thread-safe sin necesidad de sincronización.
     * 
     * @return la instancia única de IdleManager
     */
    public static IdleManager getInstance() {
        return SingletonHolder.INSTANCE;
    }

    /**
     * Inicia el temporizador de inactividad.
     * 
     * @param timeoutSeconds tiempo de espera en segundos antes de ejecutar la acción
     * @param onTimeout acción a ejecutar cuando se alcance el timeout
     */
    public void start(int timeoutSeconds, Runnable onTimeout) {
        this.onTimeout = onTimeout;

        idleTimer = new Timeline(
            new KeyFrame(Duration.seconds(timeoutSeconds), e -> triggerTimeout())
        );
        idleTimer.setCycleCount(Timeline.INDEFINITE);
        idleTimer.playFromStart();
    }

    /**
     * Reinicia el temporizador de inactividad.
     */
    public void reset() {
        if (idleTimer != null) {
            idleTimer.stop();
            idleTimer.playFromStart();
        }
    }

    private void triggerTimeout() {
        if (onTimeout != null) {
            Platform.runLater(onTimeout);
        }
    }
    
    /**
     * Detiene el temporizador de inactividad.
     */
    public void stop() {
        if (idleTimer != null) {
            idleTimer.stop();
        }
    }
}
