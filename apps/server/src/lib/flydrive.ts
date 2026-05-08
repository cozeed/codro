import { Disk } from "flydrive";
import { FSDriver } from "flydrive/drivers/fs";
import { S3Driver } from "flydrive/drivers/s3";

import { env } from "../env";
import { getBaseUrl } from "./utils";

const drivers = {
  fs: () =>
    new FSDriver({
      location: "./uploads",
      visibility: "public",
      urlBuilder: {
        async generateURL(key: string, _filePath: string) {
          return `${getBaseUrl()}/api/uploads/${key}`;
        },
        async generateSignedURL(key: string, _filePath: string) {
          return `${getBaseUrl()}/api/uploads/${key}`;
        },
      },
    }),
  r2: () =>
    new S3Driver({
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID as string,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY as string,
      },

      endpoint: env.R2_ENDPOINT,
      region: "auto",
      supportsACL: false,

      bucket: env.R2_BUCKET,
      visibility: "private",
      urlBuilder: {
        async generateURL(key) {
          return `${env.R2_SUBDOMAIN}/${key}`;
        },
      },
    }),
};

const driverToUse = drivers[env.DRIVE_DISK];

export const disk = new Disk(driverToUse());
