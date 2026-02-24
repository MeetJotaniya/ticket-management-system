import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { TicketStatusLog } from './entities/ticket-status-log.entity';
import { TicketComment } from './entities/ticket-comment.entity';
import { User } from '../users/entities/user.entity';
import { RoleEnum } from '../roles/entities/role.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketStatusLog)
    private statusLogRepository: Repository<TicketStatusLog>,
    @InjectRepository(TicketComment)
    private commentRepository: Repository<TicketComment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createTicketDto: CreateTicketDto, userId: number): Promise<Ticket> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('User not found.....');
    }

    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      created_by: user,
      status: TicketStatus.OPEN,
    });

    return await this.ticketRepository.save(ticket);
  }

  async findAll(user: User): Promise<Ticket[]> {
    const userWithRole = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['role'],
    });

    if (!userWithRole) {
      throw new NotFoundException('User not found.....');
    }

    const queryBuilder = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.created_by', 'created_by')
      .leftJoinAndSelect('created_by.role', 'creator_role')
      .leftJoinAndSelect('ticket.assigned_to', 'assigned_to')
      .leftJoinAndSelect('assigned_to.role', 'assignee_role');

    if (userWithRole.role.name === RoleEnum.MANAGER) {
      return await queryBuilder.getMany();
    } else if (userWithRole.role.name === RoleEnum.SUPPORT) {
      return await queryBuilder
        .where('ticket.assigned_to = :userId', { userId: user.id })
        .getMany();
    } else {
      return await queryBuilder
        .where('ticket.created_by = :userId', { userId: user.id })
        .getMany();
    }
  }

  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['created_by', 'created_by.role', 'assigned_to', 'assigned_to.role'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found.....');
    }

    return ticket;
  }

  async addComment(ticketId: number, createCommentDto: CreateCommentDto, user: User): Promise<TicketComment> {
    const ticket = await this.findOne(ticketId);

    await this.checkCommentAccess(ticket, user);

    const comment = this.commentRepository.create({
      ticket,
      user,
      comment: createCommentDto.comment,
    });

    return await this.commentRepository.save(comment);
  }

  async getComments(ticketId: number, user: User): Promise<TicketComment[]> {
    const ticket = await this.findOne(ticketId);

    await this.checkCommentAccess(ticket, user);

    return await this.commentRepository.find({
      where: { ticket: { id: ticketId } },
      relations: ['user', 'user.role'],
      order: { created_at: 'ASC' },
    });
  }

  async updateComment(commentId: number, updateCommentDto: UpdateCommentDto, user: User): Promise<TicketComment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user', 'user.role'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const userWithRole = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['role'],
    });

    if (comment.user.id !== user.id && userWithRole?.role.name !== RoleEnum.MANAGER) {
      throw new ForbiddenException('can\'t edit comment');
    }

    comment.comment = updateCommentDto.comment;
    return await this.commentRepository.save(comment);
  }

  async deleteComment(commentId: number, user: User): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user', 'user.role'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const userWithRole = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['role'],
    });

    if (comment.user.id !== user.id && userWithRole?.role.name !== RoleEnum.MANAGER) {
      throw new ForbiddenException('Aa comment delete no kri sko tme');
    }

    await this.commentRepository.remove(comment);
  }

  private async checkCommentAccess(ticket: Ticket, user: User): Promise<void> {
    const userWithRole = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['role'],
    });

    if (!userWithRole) {
      throw new NotFoundException('User nathi madto');
    }

    const isManager = userWithRole.role.name === RoleEnum.MANAGER;
    const isAssigned = ticket.assigned_to?.id === user.id;
    const isOwner = ticket.created_by.id === user.id;

    if (!isManager && !isAssigned && !isOwner) {
      throw new ForbiddenException('can\'t access this comment');
    }
  }
}