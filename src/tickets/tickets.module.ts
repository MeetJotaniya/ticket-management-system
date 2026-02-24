import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController, CommentsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { TicketStatusLog } from './entities/ticket-status-log.entity';
import { TicketComment } from './entities/ticket-comment.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketStatusLog, TicketComment, User]),
  ],
  controllers: [TicketsController, CommentsController],
  providers: [TicketsService],
})
export class TicketsModule {}
