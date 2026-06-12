package com.aleri.ssoma.entity;

/**
 * Tipo de evento SSOMA.
 *
 * INCIDENTE                 → Sin lesión ni daño material relevante.
 * ACCIDENTE_LEVE            → Lesión menor, sin descanso médico ni días perdidos.
 * ACCIDENTE_INCAPACITANTE   → Causa días perdidos / descanso médico.
 * ACCIDENTE_MORTAL          → Resulta en fallecimiento.
 */
public enum TipoIncidente {
    INCIDENTE,
    ACCIDENTE_LEVE,
    ACCIDENTE_INCAPACITANTE,
    ACCIDENTE_MORTAL
}
