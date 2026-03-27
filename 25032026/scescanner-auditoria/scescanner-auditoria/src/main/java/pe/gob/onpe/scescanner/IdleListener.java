package pe.gob.onpe.scescanner;

import javafx.scene.Scene;

/**
 *
 * @author ncoqchi
 */
public class IdleListener {

    private IdleListener(){}

     public static void attachTo(Scene scene) {
        scene.addEventFilter(javafx.scene.input.MouseEvent.ANY, e -> IdleManager.getInstance().reset());
        scene.addEventFilter(javafx.scene.input.KeyEvent.ANY, e -> IdleManager.getInstance().reset());
    }
    
}
