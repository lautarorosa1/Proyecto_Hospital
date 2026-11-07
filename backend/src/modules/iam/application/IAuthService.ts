import { LoginDto } from './dtos/LoginDto';
import { RegisterUsuarioDto } from './dtos/RegisterUsuarioDto';
import { AuthResponseDto, UsuarioProfileDto } from './dtos/AuthResponseDto';

export interface IAuthService {
  hashPassword(password: string): Promise<string>;
  login(dto: LoginDto): Promise<AuthResponseDto>;
  register(dto: RegisterUsuarioDto): Promise<AuthResponseDto>;
  getProfile(userId: string): Promise<UsuarioProfileDto>;
}

