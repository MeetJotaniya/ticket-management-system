import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Ticket, TicketStatus } from './ticket.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ticket_status_logs')
export class TicketStatusLog {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ticket_id' })
    ticket: Ticket;

    @Column({
        type: 'enum',
        enum: TicketStatus,
    })
    old_status: TicketStatus;

    @Column({
        type: 'enum',
        enum: TicketStatus,
    })
    new_status: TicketStatus;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'changed_by' })
    changed_by: User;

    @CreateDateColumn()
    changed_at: Date;
}
