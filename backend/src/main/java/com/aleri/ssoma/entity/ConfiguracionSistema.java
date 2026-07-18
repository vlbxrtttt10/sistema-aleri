package com.aleri.ssoma.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "configuracion_sistema")
public class ConfiguracionSistema {

    @Id
    @Column(length = 60)
    private String clave;

    @Column(columnDefinition = "TEXT")
    private String valor;

    public ConfiguracionSistema() {}

    public ConfiguracionSistema(String clave, String valor) {
        this.clave = clave;
        this.valor = valor;
    }

    public String getClave() { return clave; }
    public void setClave(String clave) { this.clave = clave; }
    public String getValor() { return valor; }
    public void setValor(String valor) { this.valor = valor; }
}
