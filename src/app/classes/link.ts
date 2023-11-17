export class Link {
  private readonly platforms: Map<string, string> = new Map([
    ['web', '/api/v1'],
    ['other', 'https://alta-energia.herokuapp.com/api/v1'],
  ]);

  baseUrl(platform: string): string {
    const url = this.platforms.get(platform);
    if (!url) {
      throw new Error(`No base URL found for platform: ${platform}`);
    }
    return url;
  }
}
