package pe.gob.onpe.scescanner.common.util;

import javafx.concurrent.Task;
import javafx.concurrent.Worker;
import javafx.scene.Scene;

import java.util.function.Consumer;

/**
 * Utilidad para ejecutar tareas asíncronas con manejo automático de cursor y botones.
 */
public class TaskExecutor {
    
    private TaskExecutor() {
    }
    
    /**
     * Ejecuta una tarea asíncrona con manejo automático de cursor y botones.
     * 
     * @param <T> Tipo de retorno de la tarea
     * @param task Tarea a ejecutar
     * @param scene Escena donde se cambiará el cursor
     * @param onSuccess Callback ejecutado cuando la tarea termina exitosamente
     * @param onFailed Callback ejecutado cuando la tarea falla
     * @param toggleButtons Callback para habilitar/deshabilitar botones (true = deshabilitar, false = habilitar)
     */
    public static <T> void ejecutarTarea(
            Task<T> task,
            Scene scene,
            Consumer<T> onSuccess,
            Runnable onFailed,
            Consumer<Boolean> toggleButtons) {
        
        task.stateProperty().addListener((observableValue, oldState, newState) -> {
            if (newState == Worker.State.RUNNING) {
                manejarEstadoRunning(scene);
            }
            else if (newState == Worker.State.SUCCEEDED) {
                manejarEstadoSucceeded(task, scene, onSuccess, toggleButtons);
            }
            else if (newState == Worker.State.FAILED) {
                manejarEstadoFailed(scene, onFailed, toggleButtons);
            }
        });
        
        iniciarTarea(task, scene, toggleButtons);
    }
    
    private static void manejarEstadoRunning(Scene scene) {
        scene.setCursor(javafx.scene.Cursor.WAIT);
    }
    
    private static <T> void manejarEstadoSucceeded(
            Task<T> task,
            Scene scene,
            Consumer<T> onSuccess,
            Consumer<Boolean> toggleButtons) {
        
        T result = task.getValue();
        if (onSuccess != null) {
            onSuccess.accept(result);
        }
        finalizarTarea(scene, toggleButtons);
    }
    
    private static void manejarEstadoFailed(
            Scene scene,
            Runnable onFailed,
            Consumer<Boolean> toggleButtons) {
        
        if (onFailed != null) {
            onFailed.run();
        }
        finalizarTarea(scene, toggleButtons);
    }
    
    private static void finalizarTarea(Scene scene, Consumer<Boolean> toggleButtons) {
        if (toggleButtons != null) {
            toggleButtons.accept(false);
        }
        scene.setCursor(javafx.scene.Cursor.DEFAULT);
    }
    
    private static <T> void iniciarTarea(Task<T> task, Scene scene, Consumer<Boolean> toggleButtons) {
        scene.setCursor(javafx.scene.Cursor.WAIT);
        
        if (toggleButtons != null) {
            toggleButtons.accept(true);
        }
        
        new Thread(task).start();
    }
}
