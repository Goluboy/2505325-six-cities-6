import { createWriteStream, WriteStream } from 'node:fs';

export interface FileWriterInterface {
  write(data: string): Promise<void>;
  close(): void;
}

export class TSVFileWriter implements FileWriterInterface {
  private stream: WriteStream;

  constructor(filename: string) {
    this.stream = createWriteStream(filename, { encoding: 'utf-8' });
  }

  public async write(data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.stream.write(data)) {
        resolve();
      } else {
        this.stream.once('drain', resolve);
        this.stream.once('error', reject);
      }
    });
  }

  public close(): void {
    this.stream.end();
  }
}
