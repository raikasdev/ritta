import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/info')
  async getInfo() {
    return this.appService.getInfo();
  }

  @Get('/corestatus')
  async getStatus() {
    return this.appService.getStatus();
  }
}
