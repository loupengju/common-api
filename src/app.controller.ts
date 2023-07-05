import { Bind, Body, Controller, Get, Header, Post, Query, Res, StreamableFile } from '@nestjs/common';
import { AppService } from './app.service';
import axios from 'axios';
import type { Response } from 'express';
import * as PDFLib from 'pdf-lib';
import * as ColorThief from 'colorthief';

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
  //   response.data.pipe(res);

  //   return new Promise((resolve, reject) => {
  //     res.on('finish', resolve);
  //     res.on('error', reject);
  //  });
    return new StreamableFile(response.data);
  }

  @Post('/beacon')
  @Bind(Res({ passthrough: true }))
  async beacon(@Body() query, @Res({ passthrough: true }) res: Response) {
    // 允许跨域
    res.set({
      'Access-Control-Allow-Origin': '*',
    });
    console.log(query);
    return 'ok';
  }

  /**
   * @description: 利用pdf-lib库，将传入图片转换为pdf文件
   * @return {*} 返回pdf文件流
   * @param query
   * @param res
   * @example: http://localhost:3000/pdf?url=https://www.baidu.com/img/flexible/logo/pc/result.png
   * @example: http://localhost:3000/pdf?url=https://www.baidu.com/img/flexible/logo/pc/result.png&name=百度logo
   */
  @Get('/pdf')
  @Bind(Res({ passthrough: true }))
  async pdf(@Query() query, @Res({ passthrough: true }) res: Response) {
    // 允许跨域
    res.set({
      'Access-Control-Allow-Origin': '*',
    });
    const { url, name } = query;
    const response = await _axios.get(url, {responseType: 'arraybuffer'});
    const pdfDoc = await PDFLib.PDFDocument.create();
    const pngImage = await pdfDoc.embedPng(response.data);
    const pngDims = pngImage.scale(0.5);
    const page = pdfDoc.addPage([pngDims.width, pngDims.height]);
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: pngDims.width,
      height: pngDims.height,
    });
    const pdfBytes = await pdfDoc.save();
    const pdfFile = new StreamableFile(pdfBytes);
    res.set({
      'Content-Type': pdfFile.getHeaders().type,
      'Content-Disposition': `attachment; filename=${name || 'file'}.pdf`,
    });
    return pdfFile;
  }

  /**
   * @description 使用colorthief库获取图片主题色
   * @params 参数：url
   */
  @Get('/getColor')
  @Bind(Res({ passthrough: true }))
  async getColor(@Query() query, @Res({ passthrough: true }) res: Response) {
    // 允许跨域
    res.set({
      'Access-Control-Allow-Origin': '*',
    });
    const { url } = query;
    const rgb = await ColorThief.getColor(url);
    return ['rgb(', rgb.join(','), ')'].join('');
  }
}
