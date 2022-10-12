import { Bind, Controller, Get, Query, Res, StreamableFile } from '@nestjs/common';
import { AppService } from './app.service';
import axios from 'axios';
import type { Response } from 'express';

const _axios = axios.create({
  timeout: 60 * 1000
})

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/download')
  @Bind(Res({ passthrough: true }))
  async downloadFile(@Query() query, @Res({ passthrough: true }) res: Response) {
    const { url } = query;
    const subFix = url.substring(url.lastIndexOf('.') + 1);
    const fingerPrint = url
      .split('/')
      .pop()
      ?.replace(`.${subFix}`, '');
    const response = await _axios.get(url, {responseType: 'stream'});
    res.set({
      'Content-Type': response.headers['content-type'],
      'Content-Disposition': `attachment; filename=${fingerPrint}.${subFix}`,
    });

    response.data.pipe(res);

    return new Promise((resolve, reject) => {
      res.on('finish', resolve);
      res.on('error', reject);
   });
  }
}
