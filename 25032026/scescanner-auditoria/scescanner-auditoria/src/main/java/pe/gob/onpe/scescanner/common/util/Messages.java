package pe.gob.onpe.scescanner.common.util;

public class Messages {

    public enum typeMessage
    {
        WARNING("msg_alert"),
        ERROR("msg_error"),
        QUESTION("msg_pregunta"),
        SECURITY("msg_alert"),
        CHECK("msg_check");   

        private final String img;

        typeMessage(String img)
        {
            this.img = img;
        }

        public String getImg()
        {
            return img;
        }
    }

    public enum addButtons
    {
        ONLYOK(1),
        YESNO(2),
        OKCANCEL(3),
        CONTINUECANCEL(4),
        CONTINUEFINALCANCEL(5);
        
        private final int buttons;

        addButtons(int buttons)
        {
            this.buttons = buttons;
        }

        public int getButtons()
        {
            return buttons;
        }

    }
}
