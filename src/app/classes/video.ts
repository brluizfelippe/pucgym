export class Video {
  id: number | null;
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: string;
  bucket: string;
  key: string;
  acl: string;
  contentType: string;
  storageClass: string;
  location: string;
  etag: string;
  buffer: HTMLImageElement | null;
  file: Blob | null;
  date: Date;

  constructor() {
    this.id = null;
    this.fieldname = '';
    this.originalname = '';
    this.encoding = '';
    this.mimetype = '';
    this.size = '';
    this.bucket = '';
    this.key = '';
    this.acl = '';
    this.contentType = '';
    this.storageClass = '';
    this.location = '';
    this.etag = '';
    this.buffer = null;
    this.file = null;
    this.date = new Date('0000-01-01T00:00:00Z');
  }

  update(video: Video): void {
    Object.assign(this, video);
  }

  convertVideoSizeToMB(): number {
    return Number(this.size) / 1000000;
  }
}
