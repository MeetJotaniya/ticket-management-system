import { IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { TicketPriority } from '../entities/ticket.entity';

export class CreateTicketDto {
  @IsString()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  title: string;

  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  description: string;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;
}
