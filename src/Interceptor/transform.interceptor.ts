import { CallHandler, ExecutionContext, Injectable } from "@nestjs/common";
import { execSync } from "child_process";
import { map } from "rxjs/operators";

@Injectable()
/**
 * @see https://nestjs.bootcss.com/interceptors#response-mapping
 *  */
export class TransformInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        const reqUrl = _context.switchToHttp().getRequest().url;
        if (reqUrl.includes('/download')) {
          return data;
        };
        return {
          code: 0,
          message: "请求成功",
          data: data,
          serverTime: new Date(),
        };
      })
    )
  }
}
