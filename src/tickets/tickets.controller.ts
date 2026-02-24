import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RoleEnum } from '../roles/entities/role.entity';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(RoleEnum.USER, RoleEnum.MANAGER)
  create(@Body() createTicketDto: CreateTicketDto, @Request() req) {
    return this.ticketsService.create(createTicketDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.ticketsService.findAll(req.user);
  }


  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() createCommentDto: CreateCommentDto, @Request() req) {
    return this.ticketsService.addComment(+id, createCommentDto, req.user);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string, @Request() req) {
    return this.ticketsService.getComments(+id, req.user);
  }
}

@Controller('comments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommentsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Patch(':id')
  updateComment(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto, @Request() req) {
    return this.ticketsService.updateComment(+id, updateCommentDto, req.user);
  }

  @Delete(':id')
  deleteComment(@Param('id') id: string, @Request() req) {
    return this.ticketsService.deleteComment(+id, req.user);
  }
}
