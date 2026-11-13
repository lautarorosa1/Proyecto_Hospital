import { Router } from 'express';
import { FacturacionController } from './infrastructure/FacturacionController';

const router = Router();
const controller = new FacturacionController();

// Gestión del Nomenclador (Back-Office)
router.get('/nomenclador', controller.listarNomenclador);
router.get('/nomenclador/:id', controller.obtenerPrestacion);
router.post('/nomenclador', controller.crearPrestacion);
router.put('/nomenclador/:id', controller.actualizarPrestacion);
router.delete('/nomenclador/:id', controller.eliminarPrestacion);

// Cálculo dinámico según cobertura (Patrón Strategy - HU 1.1)
router.post('/calcular', controller.simularCalculo);

// Registro de cargos y trazabilidad de enfermería (HU 2.1)
router.get('/cargos/:id', controller.obtenerCargo);
router.post('/cargos', controller.registrarCargo);
router.put('/cargos/:id', controller.actualizarCargo);
router.delete('/cargos/:id', controller.eliminarCargo);

// Cuenta corriente, liquidación y emisión de facturas
router.get('/pacientes/:pacienteId/cuenta', controller.obtenerCuentaPaciente);
router.post('/pacientes/:pacienteId/liquidar', controller.liquidarCuenta);
router.get('/facturas', controller.listarFacturas);

export default router;