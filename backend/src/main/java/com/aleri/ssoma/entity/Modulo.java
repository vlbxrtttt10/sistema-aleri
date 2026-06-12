package com.aleri.ssoma.entity;

/**
 * Módulos disponibles en la plataforma.
 * Cada Plan otorga acceso a un subconjunto de estos módulos a las empresas que lo contratan.
 * El ADMIN global tiene acceso a todos automáticamente.
 */
public enum Modulo {
    DASHBOARD,
    INCIDENTES,
    EPPS,
    COLABORADORES,
    REPORTES,
    USUARIOS,
    EMPRESAS
}
