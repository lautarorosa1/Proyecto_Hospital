import { AppDataSource } from '../../../data-source';
import { ProfesionalEntity } from './infrastructure/ProfesionalEntity';
import { ProfesionalRepository } from './infrastructure/ProfesionalRepository';
import { ProfesionalService } from './application/ProfesionalService';
import { ProfesionalController } from './adapters/ProfesionalController';
import { createProfesionalRoutes } from './adapters/profesionalRoutes';
import type { IUsuarioDirectorio } from './domain/IUsuarioDirectorio';
import { UsuarioEntity } from '../../iam/infrastructure/UsuarioEntity';
import { RolEntity } from '../../iam/infrastructure/RolEntity';
import { UsuarioRepository } from '../../iam/infrastructure/UsuarioRepository';

const profesionalRepository = new ProfesionalRepository(
  AppDataSource.getRepository(ProfesionalEntity),
);

// Puerto hacia IAM: valida el usuario elegido y vincula por email al crear.
const usuarioRepository = new UsuarioRepository(
  AppDataSource.getRepository(UsuarioEntity),
  AppDataSource.getRepository(RolEntity),
);
const usuarioDirectorio: IUsuarioDirectorio = {
  findById: async (id) => {
    const usuario = await usuarioRepository.findById(id);
    return usuario ? { id: usuario.id } : null;
  },
  findByEmail: async (email) => {
    const usuario = await usuarioRepository.findByEmail(email);
    return usuario ? { id: usuario.id } : null;
  },
};

const profesionalService = new ProfesionalService(profesionalRepository, usuarioDirectorio);
const profesionalController = new ProfesionalController(profesionalService);

export const profesionalModule = {
  controller: profesionalController,
  routes: createProfesionalRoutes(profesionalController),
};
