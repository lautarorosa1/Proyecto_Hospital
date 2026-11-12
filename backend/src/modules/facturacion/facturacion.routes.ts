import { Router } from 'express';
import { FacturacionController } from './infrastructure/FacturacionController';

const router = Router();
const controller = new FacturacionController();

// Gestión del Nomenclador (Back-Office)
router.get('/nomenclador', controller.listarNomenclador);
router.post('/nomenclador', controller.crearPrestacion);

// Cálculo dinámico según cobertura (Patrón Strategy - HU 1.1)
router.post('/calcular', controller.simularCalculo);

// Registro de cargos y trazabilidad de enfermería (HU 2.1)
router.post('/cargos', controller.registrarCargo);

// Cuenta corriente, liquidación y emisión de facturas
router.get('/pacientes/:pacienteId/cuenta', controller.obtenerCuentaPaciente);
router.post('/pacientes/:pacienteId/liquidar', controller.liquidarCuenta);
router.get('/facturas', controller.listarFacturas);

export default router;