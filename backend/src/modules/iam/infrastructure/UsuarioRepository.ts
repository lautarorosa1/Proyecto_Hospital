import { Repository } from 'typeorm';
import { CreateUsuarioData, IUsuarioRepository } from '../domain/IUsuarioRepository';
import { Permiso, Rol, Usuario } from '../domain/Rol';
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

  private toRolDomain(entity: RolEntity): Rol {
    return {
      id: entity.id,
      nombre: entity.nombre,
      permisos: (entity.permisos || []).map((p) => this.toPermisoDomain(p)),
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

  async create(data: CreateUsuarioData): Promise<Usuario> {
    const rolEntities: RolEntity[] = [];

    for (const rol of data.roles) {
      let found = await this.rolRepo.findOne({
        where: { nombre: rol.nombre },
        relations: { permisos: true },
      });
      if (!found) {
        found = this.rolRepo.create({ nombre: rol.nombre, permisos: [] });
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

  async findAllRoles(): Promise<Rol[]> {
    const entities = await this.rolRepo.find({
      relations: { permisos: true },
    });
    return entities.map((r) => this.toRolDomain(r));
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
}
