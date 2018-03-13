export interface IConfiguration {
  http_port: string;
  log_level: string;
  log_file: string;
  log_folder: string;
  images_expiration: number;
}

export class Configuration implements IConfiguration {
  http_port: string;
  log_level: string;
  log_file: string;
  log_folder: string;
  images_expiration: number;

  constructor(configuration: IConfiguration) {
    this.http_port = configuration.http_port;
    this.log_level = configuration.log_level;
    this.log_file = configuration.log_file;
    this.log_folder = configuration.log_folder;
    this.images_expiration = configuration.images_expiration;
  }
}