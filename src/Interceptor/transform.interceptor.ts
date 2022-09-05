import { CallHandler, ExecutionContext, Injectable } from "@nestjs/common";
import { execSync } from "child_process";
import { map } from "rxjs/operators";

const excludes = ['/download'];

@Injectable()
/**
 * @see https://nestjs.bootcss.com/interceptors#response-mapping
 *  */
export class TransformInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler) {
    const reqUrl = _context.switchToHttp().getRequest().url;
    if (excludes.some(requestUrl => reqUrl.includes(requestUrl))) {
      return next.handle();
    };

    return next.handle().pipe(
      map((data) => {
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
