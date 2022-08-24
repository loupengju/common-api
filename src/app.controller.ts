import { Bind, Controller, Get, Query, Res, StreamableFile } from '@nestjs/common';
import { AppService } from './app.service';
import axios from 'axios';
import { createReadStream, createWriteStream } from 'fs';
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
  async downloadFile(@Query() query, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const { url } = query;
    const subFix = url.substring(url.lastIndexOf('.') + 1);
    const fingerPrint = url
      .split('/')
      .pop()
      ?.replace(`.${subFix}`, '');
    const writer = createWriteStream(`./files/${fingerPrint}.${subFix}`);
    const response = await _axios.get(url, {responseType: 'stream'});
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    res.set({
      'Content-Type': response.headers['content-type'],
      'Content-Disposition': `attachment; filename=${fingerPrint}.${subFix}`,
    });

    const file = createReadStream(`./files/${fingerPrint}.${subFix}`);
    const result = new StreamableFile(file);
    return result;
  }
}
