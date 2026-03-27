/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pe.gob.onpe.scescanner.domain;

import java.util.Date;

/**
 *
 * @author LRestan
 */
public class Login {
    
    int status;
    String message;
    String userName;
    String token;
    String refreshToken;
    String apr;
    String ncc;
    String ccc;
    String per;
    String iss;
    long iat;
    long exp;
    int ecc; 
    int exePc; //indica que se debe hacer puesta a cero en el equipo
    Date expToken;
    Date expRefToken;

    public int getEcc() {
        return ecc;
    }

    public void setEcc(int ecc) {
        this.ecc = ecc;
    }
    
    
    public int getStatus() {
        return status;
    }
    
    public void setStatus(int status) {
        this.status = status;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
    public String getApr() {
        return apr;
    }

    public void setApr(String apr) {
        this.apr = apr;
    }

    public String getNcc() {
        return ncc;
    }

    public void setNcc(String ncc) {
        this.ncc = ncc;
    }

    public String getCcc() {
        return ccc;
    }

    public void setCcc(String ccc) {
        this.ccc = ccc;
    }

    public String getPer() {
        return per;
    }

    public void setPer(String per) {
        this.per = per;
    }

    public String getIss() {
        return iss;
    }

    public void setIss(String iss) {
        this.iss = iss;
    }

    public long getIat() {
        return iat;
    }

    public void setIat(long iat) {
        this.iat = iat;
    }

    public long getExp() {
        return exp;
    }
    
    public void setExp(long exp) {
        this.exp = exp;
    }
    
    public Date getExpToken() {
        return expToken;
    }
    
    public void setExpToken(Date expToken) {
        this.expToken = expToken;
    }
    
    public Date getExpRefToken() {
        return expRefToken;
    }
    
    public void setExpRefToken(Date expRefToken) {
        this.expRefToken = expRefToken;
    }

    public int getExePc() {
        return exePc;
    }

    public void setExePc(int exePc) {
        this.exePc = exePc;
    }
    
}
