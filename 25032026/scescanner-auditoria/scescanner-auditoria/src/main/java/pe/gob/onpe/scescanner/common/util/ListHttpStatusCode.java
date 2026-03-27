/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pe.gob.onpe.scescanner.common.util;

import java.util.HashMap;
import java.util.Map;

public class ListHttpStatusCode {
    
    private ListHttpStatusCode(){
    }
    
    private static final Map<Integer, String> errorMap = new HashMap<>();
    static {
        errorMap.put(100, "Continue");
        errorMap.put(101, "Switching Protocols");
        errorMap.put(102, "Processing");
        errorMap.put(103, "Early Hints");
        errorMap.put(200, "OK");
        errorMap.put(201, "Created");
        errorMap.put(202, "Accepted");
        errorMap.put(203, "Non-Authoritative Information");
        errorMap.put(204, "No Content");
        errorMap.put(205, "Reset Content");
        errorMap.put(206, "Partial Content");
        errorMap.put(207, "Multi-Status");
        errorMap.put(208, "Already Reported");
        errorMap.put(226, "IM Used");
        errorMap.put(300, "Multiple Choices");
        errorMap.put(301, "Moved Permanently");
        errorMap.put(302, "Found");
        errorMap.put(303, "See Other");
        errorMap.put(304, "Not Modified");
        errorMap.put(305, "Use Proxy");
        errorMap.put(307, "Temporary Redirect");
        errorMap.put(308, "Permanent Redirect");
        errorMap.put(400, "Bad Request");
        errorMap.put(401, "Unauthorized");
        errorMap.put(402, "Payment Required");
        errorMap.put(403, "Forbidden");
        errorMap.put(404, "Not Found");
        errorMap.put(405, "Method Not Allowed");
        errorMap.put(406, "Not Acceptable");
        errorMap.put(407, "Proxy Authentication Required");
        errorMap.put(408, "Request Timeout");
        errorMap.put(409, "Conflict");
        errorMap.put(410, "Gone");
        errorMap.put(411, "Length Required");
        errorMap.put(412, "Precondition Failed");
        errorMap.put(413, "Payload Too Large");
        errorMap.put(414, "URI Too Long");
        errorMap.put(415, "Unsupported Media Type");
        errorMap.put(416, "Range Not Satisfiable");
        errorMap.put(417, "Expectation Failed");
        errorMap.put(418, "I'm a Teapot");
        errorMap.put(421, "Misdirected Request");
        errorMap.put(422, "Unprocessable Entity");
        errorMap.put(423, "Locked");
        errorMap.put(424, "Failed Dependency");
        errorMap.put(425, "Too Early");
        errorMap.put(426, "Upgrade Required");
        errorMap.put(428, "Precondition Required");
        errorMap.put(429, "Too Many Requests");
        errorMap.put(431, "Request Header Fields Too Large");
        errorMap.put(451, "Unavailable For Legal Reasons");
        errorMap.put(500, "Internal Server Error");
        errorMap.put(501, "Not Implemented");
        errorMap.put(502, "Bad Gateway");
        errorMap.put(503, "Service Unavailable");
        errorMap.put(504, "Gateway Timeout");
        errorMap.put(505, "HTTP Version Not Supported");
        errorMap.put(506, "Variant Also Negotiates");
        errorMap.put(507, "Insufficient Storage");
        errorMap.put(508, "Loop Detected");
        errorMap.put(510, "Not Extended");
        errorMap.put(511, "Network Authentication Required");
    }


    public static String getDescription(int errorCode) {
        return errorMap.getOrDefault(errorCode, "Código de error no encontrado");
    }
    
}
