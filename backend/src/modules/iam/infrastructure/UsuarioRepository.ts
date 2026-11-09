import { Repository } from 'typeorm';
import {
  CreateUsuarioData,
  IUsuarioRepository,
  UpdateRolData,
  UpdateUsuarioData,
} from '../domain/IUsuarioRepository';
import { Permiso, Rol, ROLES_VALIDOS, Usuario } from '../domain/Rol';
import { UsuarioEntity } from './UsuarioEntity';
import { RolEntity } from './RolEntity';
import { PermisoEntity } from './PermisoEntity';

export class UsuarioRepository implements IUsuarioRepository {
  constructor(
    private readonly usuarioRepo: Repository<UsuarioEntity>,
    private readonly rolRepo: Repository<RolEntity>,
  ) {}

  private toPermisoDomain(entity: PermisoEntity): Permiso {
    return {
      id: entity.id,
      nombre: entity.nombre,
      descripcion: entity.descripcion,
    };
  }

  private toRolDomain(entity: RolEntity, cantidadUsuarios?: number): Rol {
    return {
      id: entity.id,
      nombre: entity.nombre,
      descripcion: entity.descripcion || '',
      permisos: (entity.permisos || []).map((p) => this.toPermisoDomain(p)),
      cantidadUsuarios,
    };
  }

  private toUsuarioDomain(entity: UsuarioEntity): Usuario {
    return {
      id: entity.id,
      nombre: entity.nombre,
      apellido: entity.apellido,
      email: entity.email,
      passwordHash: entity.password_hash,
      activo: entity.activo,
      fechaCreacion: entity.fecha_creacion,
      roles: (entity.roles || []).map((r) => this.toRolDomain(r)),
    };
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const entity = await this.usuarioRepo.findOne({
      where: { email },
      relations: { roles: { permisos: true } },
    });
    return entity ? this.toUsuarioDomain(entity) : null;
  }

  async findById(id: string): Promise<Usuario | null> {
    const entity = await this.usuarioRepo.findOne({
      where: { id },
      relations: { roles: { permisos: true } },
    });
    return entity ? this.toUsuarioDomain(entity) : null;
  }

  async findAllUsuarios(): Promise<Usuario[]> {
    const entities = await this.usuarioRepo.find({
      relations: { roles: { permisos: true } },
      order: { fecha_creacion: 'DESC' },
    });
    return entities.map((u) => this.toUsuarioDomain(u));
  }

  async create(data: CreateUsuarioData): Promise<Usuario> {
    const rolEntities: RolEntity[] = [];

    for (const rol of data.roles) {
      let found = await this.rolRepo.findOne({
        where: { nombre: rol.nombre },
        relations: { permisos: true },
      });
      if (!found) {
        found = this.rolRepo.create({
          nombre: rol.nombre,
          descripcion: rol.descripcion,
          permisos: [],
        });
        found = await this.rolRepo.save(found);
      }
      rolEntities.push(found);
    }

    const entity = this.usuarioRepo.create({
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      password_hash: data.passwordHash,
      activo: true,
      roles: rolEntities,
    });

    const saved = await this.usuarioRepo.save(entity);
    return this.toUsuarioDomain(saved);
  }

  async updateUsuario(
    id: string,
    data: UpdateUsuarioData,
  ): Promise<Usuario | null> {
    const entity = await this.usuarioRepo.findOne({
      where: { id },
      relations: { roles: { permisos: true } },
    });
    if (!entity) return null;

    if (data.nombre !== undefined) entity.nombre = data.nombre;
    if (data.apellido !== undefined) entity.apellido = data.apellido;
    if (data.email !== undefined) entity.email = data.email;

    const saved = await this.usuarioRepo.save(entity);
    return this.toUsuarioDomain(saved);
  }

  async updateEstado(id: string, activo: boolean): Promise<Usuario | null> {
    const entity = await this.usuarioRepo.findOne({
      where: { id },
      relations: { roles: { permisos: true } },
    });
    if (!entity) return null;

    entity.activo = activo;
    const saved = await this.usuarioRepo.save(entity);
    return this.toUsuarioDomain(saved);
  }

  async setUsuarioRoles(id: string, roles: Rol[]): Promise<Usuario | null> {
    const entity = await this.usuarioRepo.findOne({
      where: { id },
      relations: { roles: { permisos: true } },
    });
    if (!entity) return null;

    const rolEntities: RolEntity[] = [];
    for (const rol of roles) {
      const found = await this.rolRepo.findOne({
        where: { id: rol.id },
        relations: { permisos: true },
      });
      if (found) {
        rolEntities.push(found);
      }
    }

    entity.roles = rolEntities;
    const saved = await this.usuarioRepo.save(entity);
    return this.toUsuarioDomain(saved);
  }

  async findAllRoles(): Promise<Rol[]> {
    await this.findOrCreateRoles(ROLES_VALIDOS);

    const entities = await this.rolRepo.find({
      relations: { permisos: true },
      order: { id: 'ASC' },
    });

    const usuarios = await this.usuarioRepo.find({
      relations: { roles: true },
    });

    return entities.map((r) => {
      const count = usuarios.filter((u) =>
        (u.roles || []).some((ur) => ur.id === r.id),
      ).length;
      return this.toRolDomain(r, count);
    });
  }

  async findRolById(id: number): Promise<Rol | null> {
    const entity = await this.rolRepo.findOne({
      where: { id },
      relations: { permisos: true },
    });
    return entity ? this.toRolDomain(entity) : null;
  }

  async findRolByNombre(nombre: string): Promise<Rol | null> {
    const entity = await this.rolRepo.findOne({
      where: { nombre },
      relations: { permisos: true },
    });
    return entity ? this.toRolDomain(entity) : null;
  }

  async findOrCreateRoles(nombres: string[]): Promise<Rol[]> {
    const roles: Rol[] = [];

    for (const nombre of nombres) {
      let entity = await this.rolRepo.findOne({
        where: { nombre },
        relations: { permisos: true },
      });

      if (!entity) {
        entity = this.rolRepo.create({
          nombre,
          permisos: [],
        });
        entity = await this.rolRepo.save(entity);
      }

      roles.push(this.toRolDomain(entity));
    }

    return roles;
  }

  async createRol(nombre: string, descripcion?: string): Promise<Rol> {
    const entity = this.rolRepo.create({
      nombre,
      descripcion,
      permisos: [],
    });
    const saved = await this.rolRepo.save(entity);
    return this.toRolDomain(saved, 0);
  }

  async updateRol(id: number, data: UpdateRolData): Promise<Rol | null> {
    const entity = await this.rolRepo.findOne({
      where: { id },
      relations: { permisos: true },
    });
    if (!entity) return null;

    if (data.nombre !== undefined) entity.nombre = data.nombre;
    if (data.descripcion !== undefined) entity.descripcion = data.descripcion;

    const saved = await this.rolRepo.save(entity);
    const count = await this.countUsuariosByRolId(saved.id);
    return this.toRolDomain(saved, count);
  }

  async deleteRol(id: number): Promise<boolean> {
    const result = await this.rolRepo.delete(id);
    return Boolean(result.affected && result.affected > 0);
  }

  async countUsuariosByRolId(rolId: number): Promise<number> {
    const usuarios = await this.usuarioRepo.find({
      relations: { roles: true },
    });
    return usuarios.filter((u) =>
      (u.roles || []).some((r) => r.id === rolId),
    ).length;
  }
}
