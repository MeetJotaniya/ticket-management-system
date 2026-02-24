
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    let role = await this.rolesRepository.findOne({ where: { name: createUserDto.role } });
    if (!role) {
      role = this.rolesRepository.create({ name: createUserDto.role });
      role = await this.rolesRepository.save(role);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role,
    });

    const savedUser = await this.usersRepository.save(user);
    const { password, ...result } = savedUser;
    return result;
  }

  async findAll() {
    return this.usersRepository.find({
      select: ['id', 'name', 'email', 'created_at'],
      relations: ['role'],
    });
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email }, relations: ['role'] });
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findOneWithRole(id: number) {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['role']
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}

