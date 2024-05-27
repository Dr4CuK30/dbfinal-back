import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CandidateService } from './candidate.service';

@Controller('candidate')
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}
  @Get('requirement/:reqId')
  getAppropriateCandidates(@Param('reqId') reqId: number) {
    return this.candidateService.getAppropriateCandidates(reqId);
  }

  @Get('cv/:id')
  getCandidateCV(@Param('id') username: string) {
    return this.candidateService.getCandidateCV(username);
  }

  @Post('invitation')
  sendInvitation(@Body() data) {
    return this.candidateService.sendInvitation(
      data.CONSECREQUE,
      data.INVITACION,
    );
  }

  @Get('accepted/:id')
  getCandidatesAccepted(@Param('id') id) {
    return this.candidateService.getCandidatesAccepted(id);
  }

  @Post('preselect')
  preselectCandidates(@Body() data) {
    return this.candidateService.preselectCandidates(
      data.CONSECREQUE,
      data.users,
    );
  }

  @Get('/:id/test')
  getCandidateTests(@Param('id') id: number) {
    return this.candidateService.getCandidateTests(id);
  }

  @Get('/:id/test')
  post(@Param('id') id: number) {
    return this.candidateService.getCandidateTests(id);
  }

  @Get('/:user/:test/:req')
  getUserTestData(
    @Param('user') userId,
    @Param('test') testId,
    @Param('req') reqId,
  ) {
    return this.candidateService.getUserTestData(userId, testId, reqId);
  }

  @Post('schedule-test')
  scheduleTest(@Body() data) {
    return this.candidateService.scheduleTest(
      data.IDPRUEBA,
      data.USUARIO,
      data.CONSECREQUE,
      data.FECHAPRES,
    );
  }
}
