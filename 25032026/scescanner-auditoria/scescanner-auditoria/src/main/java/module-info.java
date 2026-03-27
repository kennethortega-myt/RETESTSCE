module pe.gob.onpe.scescanner {
    requires javafx.controls;
    requires javafx.fxml;
    requires java.base;
    
    requires java.logging;
    
    requires javafx.swing;
    
    requires java.net.http;
    requires org.json;
    requires org.bytedeco.opencv;
    requires org.bytedeco.javacpp;
    requires org.bytedeco.openblas;

    requires metadata.extractor;
    
    requires com.google.zxing;
    requires com.google.zxing.javase;
        
    requires org.apache.httpcomponents.httpclient;
    requires org.apache.httpcomponents.httpcore;
    requires org.apache.commons.codec;
    requires org.apache.httpcomponents.httpmime;
    requires org.slf4j;
    requires jul.to.slf4j;


    opens pe.gob.onpe.scescanner to javafx.fxml;
    exports pe.gob.onpe.scescanner;
    
    opens pe.gob.onpe.scescanner.controller to javafx.fxml;
    exports pe.gob.onpe.scescanner.controller;
    
    exports pe.gob.onpe.scescanner.domain;
            
}

