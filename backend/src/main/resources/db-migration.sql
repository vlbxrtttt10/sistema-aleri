-- Eliminar constraint de rol si existe (para permitir SUBADMIN)
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;

-- Renombrar plan ELITE a ALERI si existe
UPDATE planes SET nombre = 'ALERI' WHERE nombre = 'ELITE';
