import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum RoleEnum {
    MANAGER = 'MANAGER',
    SUPPORT = 'SUPPORT',
    USER = 'USER',
}

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: RoleEnum,
        unique: true,
    })
    name: RoleEnum;

    @OneToMany(() => User, (user) => user.role)
    users: User[];
}